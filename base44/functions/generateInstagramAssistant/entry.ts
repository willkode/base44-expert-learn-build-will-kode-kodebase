import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ---------------------------------------------------------------------------
// Instagram AI Assistant
// Rewrites captions, generates hooks/hashtags/alt text, and ideates concepts.
// Instagram is visual-first — captions support, not replace, the media.
// action: rewrite_caption | rewrite_reel_caption | rewrite_carousel_caption |
//         generate_hooks | generate_hashtags | generate_first_comment_hashtags |
//         generate_alt_text | generate_image_concept | generate_reel_idea |
//         generate_carousel_outline | make_more_visual | make_more_community |
//         make_more_sales | make_shorter
// ---------------------------------------------------------------------------

const CAPTION_LIMIT = 2200;

const ACTION_INSTRUCTIONS = {
  rewrite_caption:
    "Rewrite this as a strong Instagram feed caption: an attention-grabbing first line, scannable short paragraphs, a clear point, and a soft call to action. Return it in `caption`.",
  rewrite_reel_caption:
    "Rewrite this as a punchy Instagram Reel caption: short, energetic, hook-first, designed to keep people watching. Keep it concise. Return it in `caption`.",
  rewrite_carousel_caption:
    "Rewrite this as an Instagram carousel caption that tees up a multi-slide story: open with the payoff, then invite the swipe. Return it in `caption`.",
  generate_hooks:
    "Generate several alternative first-line hooks for this Instagram caption that stop the scroll. Return them in `options`. Do NOT change `caption`.",
  generate_hashtags:
    "Generate 8-15 focused, relevant Instagram hashtags (mix of niche and mid-size, no banned or spammy tags). Return them as an array of strings (with the # prefix) in `hashtags`.",
  generate_first_comment_hashtags:
    "Generate a clean block of 8-15 relevant Instagram hashtags formatted for posting as the FIRST COMMENT (so the caption stays clean). Return the full comment text in `first_comment` and the tags in `hashtags`.",
  generate_alt_text:
    "Write concise, descriptive alt text for the post's image describing what is visually shown for accessibility (no hashtags, under 1000 characters). Return it in `alt_text`.",
  generate_image_concept:
    "Describe a single strong image concept for this post that fits a dark tech aesthetic: deep navy background, glowing orange-to-amber gradient accents, minimal flat vector, subtle blueprint grid, no text. Return the concept in `notes`.",
  generate_reel_idea:
    "Outline a short Instagram Reel idea for this content: a hook, 3-5 quick beats/scenes, and an on-screen-text suggestion per beat. Return the outline in `notes`.",
  generate_carousel_outline:
    "Outline an Instagram carousel of 5-8 slides for this content: give each slide a short headline and one supporting line. Slide 1 must hook, the last must call to action. Return the outline in `notes`.",
  make_more_visual:
    "Rewrite the caption to lean into the visual: reference what the viewer sees, use vivid concrete language, and add tasteful emoji where natural. Return it in `caption`.",
  make_more_community:
    "Rewrite the caption to be more community-focused: ask a genuine question, invite replies/saves, and use an inclusive, conversational voice. Return it in `caption`.",
  make_more_sales:
    "Rewrite the caption to be more sales-focused while staying authentic to Instagram: clear value, one strong call to action, link-in-bio reference. No hype or false claims. Return it in `caption`.",
  make_shorter:
    "Rewrite the caption to be significantly shorter and tighter while keeping the hook and the core point. Return it in `caption`.",
};

function buildSchema(action) {
  if (action === "generate_hooks") {
    return { type: "object", properties: { options: { type: "array", items: { type: "string" } }, notes: { type: "string" } } };
  }
  if (action === "generate_hashtags") {
    return { type: "object", properties: { hashtags: { type: "array", items: { type: "string" } }, notes: { type: "string" } } };
  }
  if (action === "generate_first_comment_hashtags") {
    return { type: "object", properties: { first_comment: { type: "string" }, hashtags: { type: "array", items: { type: "string" } }, notes: { type: "string" } } };
  }
  if (action === "generate_alt_text") {
    return { type: "object", properties: { alt_text: { type: "string" }, notes: { type: "string" } } };
  }
  if (action === "generate_image_concept" || action === "generate_reel_idea" || action === "generate_carousel_outline") {
    return { type: "object", properties: { notes: { type: "string" } } };
  }
  return {
    type: "object",
    properties: {
      caption: { type: "string", description: `The Instagram caption, under ${CAPTION_LIMIT} characters.` },
      hashtags: { type: "array", items: { type: "string" } },
      notes: { type: "string" },
    },
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { action, caption = "", media_type = "image", alt_text = "", campaign_id = "" } = body || {};

    if (!action || !ACTION_INSTRUCTIONS[action]) {
      return Response.json({ error: "A valid action is required." }, { status: 400 });
    }

    // Brand context for tone.
    const brands = await base44.entities.BrandProfile.filter({ account_id: "global" }, "-created_date", 1);
    const brand = brands && brands[0] ? brands[0] : null;

    let campaign = null;
    if (campaign_id) {
      campaign = await base44.entities.SocialCampaign.get(campaign_id).catch(() => null);
    }

    const brandContext = brand
      ? `BRAND: ${brand.brand_name || "—"} — ${brand.short_description || ""} ${brand.products_services || ""}
Audience: ${brand.audience || "—"}. Tone: ${brand.tone_of_voice || brand.preferred_tone || "warm, confident, useful"}.
Instagram style: ${brand.instagram_style || "—"}.
Words to avoid: ${(brand.banned_words || []).join(", ") || "—"}.`
      : "BRAND: (not set — assume a credible developer/SaaS tool with a warm, confident, visual voice.)";

    const prompt = `You are an expert Instagram content creator helping an admin publish high-performing posts.
Instagram is visual-first: captions support the media, they do not replace it. Lead with a scroll-stopping first line.

${brandContext}
${campaign ? `CAMPAIGN GOAL: ${campaign.goal || "—"} — ${campaign.key_message || ""}` : ""}

CURRENT CONTENT:
- Media type: ${media_type}
- Caption: ${caption || "—"}
- Alt text: ${alt_text || "—"}

TASK: ${ACTION_INSTRUCTIONS[action]}

RULES:
- Captions must stay under ${CAPTION_LIMIT} characters.
- Never fabricate statistics, testimonials, or endorsements.
- Keep it native to Instagram: human, visual, save-worthy. No engagement-bait like "follow for follow".
- Use hashtags only where the action asks for them; keep them relevant and non-spammy.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "gpt_5_5",
      response_json_schema: buildSchema(action),
    });

    try {
      await base44.entities.SocialAutomationLog.create({
        account_id: "global",
        user_id: user.id,
        event_type: `instagram_assistant_${action}`,
        platform: "instagram",
        related_campaign_id: campaign_id || undefined,
        status: "success",
        message: `Instagram assistant: ${action}`,
        metadata: { action, media_type },
      });
    } catch (_e) { /* best-effort */ }

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});