import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ---------------------------------------------------------------------------
// Reddit AI Assistant
// Rewrites/reframes Reddit content and suggests subreddit targeting.
// action: rewrite_for_reddit | make_less_promotional | make_discussion_based |
//         turn_into_question | value_first_educational | add_disclosure | suggest_subreddits
// ---------------------------------------------------------------------------

const ACTION_INSTRUCTIONS = {
  rewrite_for_reddit:
    "Rewrite the content so it reads natively for Reddit: authentic, plain-spoken, discussion-first, and NOT like an advertisement. Keep it specific and useful.",
  make_less_promotional:
    "Rewrite the content to remove promotional, salesy, or ad-like language. Lead with genuine value or insight. Mention the product only if essential, and softly.",
  make_discussion_based:
    "Rewrite the content as a discussion starter that invites the community to share opinions and experiences. End with an open prompt.",
  turn_into_question:
    "Turn the content into a genuine question post that asks the community for input, experiences, or advice. The title should be a clear question.",
  value_first_educational:
    "Rewrite the content as a value-first educational post that teaches something useful with concrete steps or examples. No pitch.",
  add_disclosure:
    "Keep the content largely the same but add a short, honest disclosure note (promotion_disclosure) stating the author's affiliation, e.g. 'Disclosure: I work on this tool.' Keep the body honest and non-spammy.",
  suggest_subreddits:
    "Do NOT rewrite the post. Instead, suggest relevant subreddits where this content could fit, with notes on each community's norms and self-promotion rules.",
};

function buildSchema(action) {
  if (action === "suggest_subreddits") {
    return {
      type: "object",
      properties: {
        subreddit_suggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              subreddit: { type: "string" },
              why: { type: "string" },
              rules_notes: { type: "string" },
              self_promo_allowed: { type: "string", description: "yes | limited | no | unknown" },
            },
          },
        },
        notes: { type: "string" },
      },
    };
  }
  return {
    type: "object",
    properties: {
      title: { type: "string" },
      body: { type: "string" },
      suggested_comment: { type: "string", description: "An optional helpful first comment to add context." },
      promotion_disclosure: { type: "string", description: "A disclosure note if the post is promotional, else empty." },
      promotion_risk: { type: "string", description: "low | medium | high" },
      subreddit_rules_notes: { type: "string" },
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
    const { action, title = "", post_body = "", subreddit = "", topic = "", campaign_id = "" } = body || {};

    if (!action || !ACTION_INSTRUCTIONS[action]) {
      return Response.json({ error: "A valid action is required." }, { status: 400 });
    }
    if (action !== "suggest_subreddits" && !title.trim() && !post_body.trim()) {
      return Response.json({ error: "Provide a title or body to work with." }, { status: 400 });
    }
    if (action === "suggest_subreddits" && !title.trim() && !post_body.trim() && !topic.trim()) {
      return Response.json({ error: "Provide a topic, title, or body to target subreddits." }, { status: 400 });
    }

    // Brand context for tone + honesty.
    const brands = await base44.entities.BrandProfile.filter({ account_id: "global" }, "-created_date", 1);
    const brand = brands && brands[0] ? brands[0] : null;

    let campaign = null;
    if (campaign_id) {
      campaign = await base44.entities.SocialCampaign.get(campaign_id).catch(() => null);
    }

    const brandContext = brand
      ? `BRAND: ${brand.brand_name || "—"} — ${brand.short_description || ""} ${brand.products_services || ""}
Audience: ${brand.audience || "—"}. Tone: ${brand.tone_of_voice || brand.preferred_tone || "credible, helpful"}.
Words to avoid: ${(brand.banned_words || []).join(", ") || "—"}.`
      : "BRAND: (not set — assume a credible developer/SaaS tool, humble tone.)";

    const prompt = `You are a Reddit community expert helping an admin publish content that respects Reddit culture.
Reddit users are skeptical of marketing. Posts must feel native, honest, and discussion-first.

${brandContext}
${campaign ? `CAMPAIGN GOAL: ${campaign.goal || "—"} — ${campaign.key_message || ""}` : ""}

CURRENT CONTENT:
- Target subreddit: ${subreddit || "(not chosen)"}
- Topic: ${topic || "—"}
- Title: ${title || "—"}
- Body: ${post_body || "—"}

TASK: ${ACTION_INSTRUCTIONS[action]}

RULES:
- Never fabricate statistics, testimonials, or endorsements.
- Never sound spammy. Avoid hashtags (they feel unnatural on Reddit).
- Keep titles under 300 characters.
- If the content promotes the author's own product, set a clear promotion_disclosure and lower the promotion_risk by softening the pitch.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "gpt_5_5",
      response_json_schema: buildSchema(action),
    });

    try {
      await base44.entities.SocialAutomationLog.create({
        account_id: "global",
        user_id: user.id,
        event_type: `reddit_assistant_${action}`,
        platform: "reddit",
        related_campaign_id: campaign_id || undefined,
        status: "success",
        message: `Reddit assistant: ${action}${subreddit ? ` (r/${subreddit})` : ""}`,
        metadata: { action, subreddit },
      });
    } catch (_e) { /* best-effort */ }

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});