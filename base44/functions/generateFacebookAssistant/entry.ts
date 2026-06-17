import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ---------------------------------------------------------------------------
// Facebook Page AI Assistant
// Rewrites/reframes Facebook Page post copy for different content goals.
// action: rewrite_page_update | rewrite_community | rewrite_offer |
//         rewrite_educational | make_conversational | make_less_salesy |
//         add_cta | generate_image_caption | generate_link_text |
//         generate_event | generate_customer_update
// ---------------------------------------------------------------------------

const ACTION_INSTRUCTIONS = {
  rewrite_page_update:
    "Rewrite this as a polished Facebook Page status update: clear, friendly, on-brand, and easy to read in the feed. Return it in `message`.",
  rewrite_community:
    "Rewrite this as a community-focused Facebook post that invites genuine conversation and makes followers feel part of something — warm, human, and inclusive (without engagement-bait phrases like 'like and share' or 'tag a friend'). Return it in `message`.",
  rewrite_offer:
    "Rewrite this as a Facebook offer/promotion post: lead with the value, state the offer clearly, and add a clear but tasteful call to action. Avoid spammy hype. Return it in `message`.",
  rewrite_educational:
    "Rewrite this as an educational Facebook post that teaches the reader something useful in a skimmable way (short paragraphs or a tight list). Lead with the value, not the product. Return it in `message`.",
  make_conversational:
    "Rewrite this to sound more conversational and personable — like a real person from the brand talking to the community. Keep it natural and friendly. Return it in `message`.",
  make_less_salesy:
    "Rewrite this to remove salesy, hypey, or ad-like language. Make it sound credible and genuinely helpful. Return it in `message`.",
  add_cta:
    "Add a natural, non-pushy call to action that fits the post's tone and goal. Return the full updated post in `message`.",
  generate_image_caption:
    "Write a strong, engaging Facebook caption to accompany an image for this content. Keep it concise and feed-friendly. Return it in `message`.",
  generate_link_text:
    "Write compelling Facebook post text to introduce and share a link about this content — give people a reason to click without clickbait. Return it in `message`.",
  generate_event:
    "Write a Facebook event announcement post for this content: what's happening, why it matters, and how to take part. Friendly and clear. Return it in `message`.",
  generate_customer_update:
    "Write a Facebook customer update/announcement post for this content: communicate the news clearly, set the right tone, and reassure or excite the audience as appropriate. Return it in `message`.",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { action, message = "", topic = "", campaign_id = "" } = body || {};

    if (!action || !ACTION_INSTRUCTIONS[action]) {
      return Response.json({ error: "A valid action is required." }, { status: 400 });
    }
    if (!message.trim() && !topic.trim()) {
      return Response.json({ error: "Provide post text or a topic to work with." }, { status: 400 });
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
Audience: ${brand.audience || "—"}. Tone: ${brand.tone_of_voice || brand.preferred_tone || "friendly, helpful"}.
Facebook style: ${brand.facebook_content_style || "—"}.
Words to avoid: ${(brand.banned_words || []).join(", ") || "—"}.`
      : "BRAND: (not set — assume a credible developer/SaaS tool with a friendly, helpful voice.)";

    const prompt = `You are an expert Facebook Page copywriter helping an admin publish high-performing Page posts.
Facebook rewards genuine, valuable, conversational content. NEVER use engagement bait (e.g. "like and share", "tag a friend", "comment below") — Facebook reduces reach for it.

${brandContext}
${campaign ? `CAMPAIGN GOAL: ${campaign.goal || "—"} — ${campaign.key_message || ""}` : ""}

CURRENT CONTENT:
- Post text: ${message || "—"}
- Topic/brief: ${topic || "—"}

TASK: ${ACTION_INSTRUCTIONS[action]}

RULES:
- Never fabricate statistics, testimonials, or endorsements.
- No engagement bait of any kind.
- Keep it native to Facebook: warm, clear, skimmable.
- Use hashtags sparingly (0–2) and only when they add value.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "gpt_5_5",
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string", description: "The rewritten/generated Facebook post text." },
          notes: { type: "string" },
        },
      },
    });

    try {
      await base44.entities.SocialAutomationLog.create({
        account_id: "global",
        user_id: user.id,
        event_type: `facebook_assistant_${action}`,
        platform: "facebook",
        related_campaign_id: campaign_id || undefined,
        status: "success",
        message: `Facebook assistant: ${action}`,
        metadata: { action },
      });
    } catch (_e) { /* best-effort */ }

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});