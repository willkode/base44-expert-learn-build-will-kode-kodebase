import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ---------------------------------------------------------------------------
// LinkedIn AI Assistant
// Rewrites/reframes LinkedIn post commentary into professional formats.
// action: thought_leadership | founder_insight | educational |
//         product_announcement | add_cta | add_hashtags | improve_hook | make_skimmable
// ---------------------------------------------------------------------------

const ACTION_INSTRUCTIONS = {
  thought_leadership:
    "Rewrite the post as a credible thought-leadership piece: open with a strong point of view, support it with a concrete insight or observation, and end with a reflective takeaway. Professional, confident, never preachy.",
  founder_insight:
    "Rewrite the post as a founder sharing a genuine, first-person insight or lesson learned while building. Honest, specific, humble, and relatable. Avoid bragging.",
  educational:
    "Rewrite the post as an educational, value-first post that teaches the reader something useful with clear, concrete steps or examples. No fluff, no hard pitch.",
  product_announcement:
    "Rewrite the post as a polished product announcement that leads with the customer benefit, explains what's new, and ends with a clear, professional call to action.",
  add_cta:
    "Keep the post largely intact but add a clear, professional call to action at the end that invites the right next step (comment, follow, learn more) without sounding salesy.",
  add_hashtags:
    "Keep the post text intact and append 3–5 relevant, professional hashtags on a new line at the end. Use established, high-signal hashtags, not spammy ones.",
  improve_hook:
    "Keep the body intact but rewrite ONLY the opening line(s) into a stronger scroll-stopping hook that earns the click on 'see more'. Avoid clickbait.",
  make_skimmable:
    "Reformat the post to be more skimmable on LinkedIn: short lines, generous line breaks, optional bullet points, and clear structure. Keep the meaning and message identical.",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { action, commentary = "", topic = "", campaign_id = "" } = body || {};

    if (!action || !ACTION_INSTRUCTIONS[action]) {
      return Response.json({ error: "A valid action is required." }, { status: 400 });
    }
    if (!commentary.trim() && !topic.trim()) {
      return Response.json({ error: "Provide post text or a topic to work with." }, { status: 400 });
    }

    // Brand context for tone + voice.
    const brands = await base44.entities.BrandProfile.filter({ account_id: "global" }, "-created_date", 1);
    const brand = brands && brands[0] ? brands[0] : null;

    let campaign = null;
    if (campaign_id) {
      campaign = await base44.entities.SocialCampaign.get(campaign_id).catch(() => null);
    }

    const brandContext = brand
      ? `BRAND: ${brand.brand_name || "—"} — ${brand.short_description || ""} ${brand.products_services || ""}
Audience: ${brand.audience || "—"}. Tone: ${brand.tone_of_voice || brand.preferred_tone || "credible, professional"}.
Default CTA: ${brand.default_call_to_action || "—"}.
Words to avoid: ${(brand.banned_words || []).join(", ") || "—"}.`
      : "BRAND: (not set — assume a credible developer/SaaS tool, professional tone.)";

    const prompt = `You are a LinkedIn content expert helping an admin publish a high-performing post.
LinkedIn rewards genuine, professional, value-first content with a strong hook and clear structure.

${brandContext}
${campaign ? `CAMPAIGN GOAL: ${campaign.goal || "—"} — ${campaign.key_message || ""}` : ""}

CURRENT POST TEXT:
${commentary || "(none — write from the topic)"}

TOPIC (if no text): ${topic || "—"}

TASK: ${ACTION_INSTRUCTIONS[action]}

RULES:
- Never fabricate statistics, testimonials, metrics, or endorsements.
- Keep it professional and credible — no hype, no spam, no excessive emojis.
- Stay under 3000 characters.
- Return the full, ready-to-post text in the "commentary" field.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "gpt_5_5",
      response_json_schema: {
        type: "object",
        properties: {
          commentary: { type: "string", description: "The full rewritten LinkedIn post text, ready to publish." },
          notes: { type: "string", description: "A short note on what changed." },
        },
      },
    });

    try {
      await base44.entities.SocialAutomationLog.create({
        account_id: "global",
        user_id: user.id,
        event_type: `linkedin_assistant_${action}`,
        platform: "linkedin",
        related_campaign_id: campaign_id || undefined,
        status: "success",
        message: `LinkedIn assistant: ${action}`,
        metadata: { action },
      });
    } catch (_e) { /* best-effort */ }

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});