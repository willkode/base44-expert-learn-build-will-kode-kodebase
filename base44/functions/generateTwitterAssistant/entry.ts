import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ---------------------------------------------------------------------------
// X/Twitter AI Assistant
// Rewrites/reframes tweet content, builds threads, and generates options.
// action: rewrite_shorter | make_punchy | turn_into_thread | generate_hooks |
//         generate_variations | add_cta | add_hashtags | make_less_salesy |
//         make_controversial | linkedin_to_thread
// ---------------------------------------------------------------------------

const CHAR_LIMIT = 280;

const ACTION_INSTRUCTIONS = {
  rewrite_shorter:
    "Rewrite the tweet so it is significantly shorter and tighter while keeping the core point. Remove filler. Return it in `text`.",
  make_punchy:
    "Rewrite the tweet to be punchier and more attention-grabbing: strong hook, confident voice, concrete language, no fluff. Return it in `text`.",
  turn_into_thread:
    "Turn the content into a compelling X thread. Put the hook tweet in `text` and the remaining tweets in `thread` (each under 280 characters, each a distinct idea, logically ordered).",
  generate_hooks:
    "Generate several alternative opening hook lines for this tweet. Return them in `options` (each under 280 characters). Do NOT change `text`.",
  generate_variations:
    "Generate exactly 5 distinct variations of this tweet, each under 280 characters, with different angles or tones. Return them in `options`.",
  add_cta:
    "Add a natural, non-pushy call to action to the tweet that fits its tone. Return the full updated tweet in `text`.",
  add_hashtags:
    "Add 1-2 relevant, high-quality hashtags to the tweet (never more). Keep it under 280 characters. Return the full updated tweet in `text`.",
  make_less_salesy:
    "Rewrite the tweet to remove salesy, hypey, or ad-like language. Make it sound like a credible person sharing genuine value. Return it in `text`.",
  make_controversial:
    "Rewrite the tweet to take a bolder, more opinionated, slightly contrarian stance that sparks discussion — while staying professional, respectful, and defensible. No insults, no misinformation. Return it in `text`.",
  linkedin_to_thread:
    "Convert this long-form LinkedIn-style post into a native X thread. Put the hook in `text` and the rest in `thread` (each under 280 characters, punchy, no corporate tone).",
};

function buildSchema(action) {
  if (action === "generate_hooks" || action === "generate_variations") {
    return {
      type: "object",
      properties: {
        options: { type: "array", items: { type: "string" } },
        notes: { type: "string" },
      },
    };
  }
  return {
    type: "object",
    properties: {
      text: { type: "string", description: "The primary (first) tweet, under 280 characters." },
      thread: {
        type: "array",
        items: { type: "string" },
        description: "Follow-up tweets for a thread, each under 280 characters. Empty if not a thread.",
      },
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
    const { action, text = "", thread = [], campaign_id = "" } = body || {};

    if (!action || !ACTION_INSTRUCTIONS[action]) {
      return Response.json({ error: "A valid action is required." }, { status: 400 });
    }
    const threadText = Array.isArray(thread) ? thread.filter(Boolean).join("\n\n") : "";
    if (!text.trim() && !threadText.trim()) {
      return Response.json({ error: "Provide tweet text to work with." }, { status: 400 });
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
Audience: ${brand.audience || "—"}. Tone: ${brand.tone_of_voice || brand.preferred_tone || "confident, useful"}.
Words to avoid: ${(brand.banned_words || []).join(", ") || "—"}.`
      : "BRAND: (not set — assume a credible developer/SaaS tool with a sharp, confident voice.)";

    const prompt = `You are an expert X/Twitter copywriter helping an admin publish high-performing posts.
X rewards clarity, strong hooks, and a human voice. Every tweet MUST be under ${CHAR_LIMIT} characters.

${brandContext}
${campaign ? `CAMPAIGN GOAL: ${campaign.goal || "—"} — ${campaign.key_message || ""}` : ""}

CURRENT CONTENT:
- Primary tweet: ${text || "—"}
- Existing thread: ${threadText || "—"}

TASK: ${ACTION_INSTRUCTIONS[action]}

RULES:
- Never exceed ${CHAR_LIMIT} characters in any single tweet.
- Never fabricate statistics, testimonials, or endorsements.
- Keep it native to X: punchy, specific, no corporate filler.
- Use at most 1-2 hashtags, and only when they add value.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "gpt_5_5",
      response_json_schema: buildSchema(action),
    });

    try {
      await base44.entities.SocialAutomationLog.create({
        account_id: "global",
        user_id: user.id,
        event_type: `twitter_assistant_${action}`,
        platform: "twitter",
        related_campaign_id: campaign_id || undefined,
        status: "success",
        message: `X/Twitter assistant: ${action}`,
        metadata: { action },
      });
    } catch (_e) { /* best-effort */ }

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});