import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Per-platform variant labels expected by the model (keeps output predictable).
const VARIANT_BLUEPRINT = {
  twitter: ["punchy", "educational", "sales-driven"],
  reddit: ["discussion post", "value-first educational post", "problem/solution post"],
  linkedin: ["founder/expert insight", "educational post", "offer/announcement post"],
  facebook: ["community update", "promotional/offer post", "educational/value post"],
  instagram: ["image caption", "Reel caption", "carousel caption"],
};

const ALL_PLATFORMS = ["twitter", "reddit", "linkedin", "facebook", "instagram"];

function buildResponseSchema(platforms) {
  const properties = {
    title_internal: { type: "string" },
    platform_variants: { type: "object", properties: {}, additionalProperties: true },
    global_hashtags: { type: "array", items: { type: "string" } },
    image_prompt: { type: "string" },
    image_alt_text: { type: "string" },
    cta: { type: "string" },
    compliance_notes: { type: "string" },
    quality_checklist: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          passed: { type: "boolean" },
          detail: { type: "string" },
        },
      },
    },
    quality_score: { type: "number", description: "0-100 overall quality/safety score" },
  };

  const variantProps = {
    twitter: {
      type: "array",
      items: {
        type: "object",
        properties: {
          variant_label: { type: "string" },
          text: { type: "string" },
          hashtags: { type: "array", items: { type: "string" } },
          thread: { type: "array", items: { type: "string" } },
          notes: { type: "string" },
        },
      },
    },
    reddit: {
      type: "array",
      items: {
        type: "object",
        properties: {
          variant_label: { type: "string" },
          title: { type: "string" },
          body: { type: "string" },
          subreddit_notes: { type: "string" },
          promotion_risk: { type: "string" },
          disclosure_suggestion: { type: "string" },
          notes: { type: "string" },
        },
      },
    },
    linkedin: {
      type: "array",
      items: {
        type: "object",
        properties: {
          variant_label: { type: "string" },
          text: { type: "string" },
          hashtags: { type: "array", items: { type: "string" } },
          format_notes: { type: "string" },
          notes: { type: "string" },
        },
      },
    },
    facebook: {
      type: "array",
      items: {
        type: "object",
        properties: {
          variant_label: { type: "string" },
          text: { type: "string" },
          post_type: { type: "string" },
          link_url: { type: "string" },
          cta: { type: "string" },
          hashtags: { type: "array", items: { type: "string" } },
          notes: { type: "string" },
        },
      },
    },
    instagram: {
      type: "array",
      items: {
        type: "object",
        properties: {
          variant_label: { type: "string" },
          caption: { type: "string" },
          media_type: { type: "string" },
          hashtags: { type: "array", items: { type: "string" } },
          first_comment: { type: "string" },
          image_or_reel_prompt: { type: "string" },
          alt_text: { type: "string" },
          notes: { type: "string" },
        },
      },
    },
  };

  for (const p of platforms) {
    if (variantProps[p]) properties.platform_variants.properties[p] = variantProps[p];
  }
  return { type: "object", properties };
}

function platformRules(platforms) {
  const rules = {
    twitter: `X / TWITTER:
- Short, direct copy with a strong hook. Respect ~280 char limits per tweet.
- Optional hashtags (max 2-3, never stuffed). Avoid clickbait.
- Provide an optional "thread" array (3-6 tweets) when the topic benefits from it, else leave thread empty.
- Exactly 3 variants in this order: punchy, educational, sales-driven.`,
    reddit: `REDDIT:
- Must feel native to Reddit and NOT like an ad. Discussion-first framing.
- Provide "title" and "body" separately. Include "subreddit_notes" (where to post + community norms).
- Include a soft CTA only when appropriate. Set "promotion_risk" (low/medium/high) and a "disclosure_suggestion" if promotional.
- Avoid hashtag-heavy content. Exactly 3 variants: discussion post, value-first educational post, problem/solution post.`,
    linkedin: `LINKEDIN:
- Professional, authority-driven. Strong opening line, short readable paragraphs, optional bullets, a clear takeaway and CTA.
- Hashtags at the end (3-5). Exactly 3 variants: founder/expert insight, educational post, offer/announcement post.`,
    facebook: `FACEBOOK PAGE:
- Conversational and community-friendly for Page followers. Strong first sentence; copy can be slightly longer.
- Avoid engagement bait and spammy wording. Light hashtag use. Include a CTA when appropriate.
- Set "post_type" to one of: text, link, image, video. Exactly 3 variants: community update, promotional/offer post, educational/value post.`,
    instagram: `INSTAGRAM:
- Visual-first caption with a strong hook in the first line. Use line breaks for readability.
- Set "media_type" to one of: image, video, reel, carousel, story. Include "image_or_reel_prompt" (concept), "alt_text", and optional "first_comment" hashtags.
- Hashtags should not be excessive. Exactly 3 variants: image caption, Reel caption, carousel caption.`,
  };
  return platforms.map((p) => rules[p]).filter(Boolean).join("\n\n");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const {
      campaign_id,
      selected_platforms = [],
      topic = "",
      content_type = "educational_tip",
      tone = "",
      number_of_variations = 3,
      include_hashtags = true,
      include_image_prompt = true,
      include_call_to_action = true,
      custom_instructions = "",
      source_text = "",
      only_platforms = null, // when regenerating a subset
      regenerate_target = null, // "all" | "hashtags" | "image_prompt" | "cta" | platform key
      save = false, // when true, persist results as SocialPost records
    } = body || {};

    const platforms = (only_platforms && only_platforms.length ? only_platforms : selected_platforms)
      .filter((p) => ALL_PLATFORMS.includes(p));

    if (!topic || !topic.trim()) {
      return Response.json({ error: "A topic is required to generate content." }, { status: 400 });
    }
    if (platforms.length === 0) {
      return Response.json({ error: "Select at least one platform." }, { status: 400 });
    }

    // Load brand profile (single workspace -> first global record).
    const brands = await base44.entities.BrandProfile.filter({ account_id: "global" }, "-created_date", 1);
    const brand = brands && brands[0] ? brands[0] : null;

    // Load campaign if provided.
    let campaign = null;
    if (campaign_id) {
      try {
        campaign = await base44.entities.SocialCampaign.get(campaign_id);
      } catch (_e) {
        campaign = null;
      }
    }

    const brandContext = brand
      ? `BRAND PROFILE:
- Name: ${brand.brand_name || "—"}
- Website: ${brand.website_url || "—"}
- What it does: ${brand.short_description || "—"} ${brand.products_services || ""}
- Audience: ${brand.audience || "—"}
- Pain points solved: ${brand.pain_points || "—"}
- Tone of voice: ${brand.tone_of_voice || brand.preferred_tone || "—"}
- Value propositions: ${(brand.value_propositions || []).join("; ") || "—"}
- Default CTA: ${brand.default_call_to_action || "—"}
- Default hashtags: ${(brand.default_hashtags || []).join(" ") || "—"}
- Words to PREFER: ${(brand.preferred_words || []).join(", ") || "—"}
- Words to AVOID: ${(brand.banned_words || []).join(", ") || "—"}
- Visual style: ${brand.visual_style || "—"}
- Facebook style: ${brand.facebook_content_style || "—"}
- Instagram style: ${brand.instagram_style || "—"}`
      : "BRAND PROFILE: (not set — infer a clean, credible, developer-tool tone.)";

    const campaignContext = campaign
      ? `CAMPAIGN:
- Name: ${campaign.name || "—"}
- Goal: ${campaign.goal || "—"}
- Key message: ${campaign.key_message || "—"}
- Target audience: ${campaign.target_audience || "—"}
- Offer / product: ${campaign.offer_details || "—"}
- Landing page: ${campaign.landing_page_url || "—"}
- Brand voice override: ${campaign.brand_voice || "—"}
- Content themes: ${(campaign.content_themes || []).join("; ") || "—"}
- Hashtag strategy: ${campaign.default_hashtag_strategy || "—"}`
      : "CAMPAIGN: (none selected — treat as a standalone post.)";

    let focusInstruction = "";
    if (regenerate_target === "hashtags") {
      focusInstruction = "FOCUS: Regenerate ONLY fresh, relevant hashtags (global_hashtags and per-platform hashtags). Keep copy concise but still fill required fields.";
    } else if (regenerate_target === "image_prompt") {
      focusInstruction = "FOCUS: Regenerate ONLY a strong image_prompt and image_alt_text. The image_prompt MUST follow this exact visual style: dark tech aesthetic, deep navy background (#0d1326 / #0a0f1e), glowing orange-to-red gradient accents (#f87171 → #fb923c → #facc15), minimal flat vector with subtle blueprint grid lines and soft glows, no text/logos/watermarks, high contrast, ample negative space.";
    } else if (regenerate_target === "cta") {
      focusInstruction = "FOCUS: Regenerate ONLY a single strong call-to-action (cta) aligned to the goal and offer.";
    }

    const prompt = `You are an expert social media copywriter and brand strategist for a developer/SaaS product.
Generate platform-specific social media content. Produce ${number_of_variations || 3} variants per platform.

${brandContext}

${campaignContext}

POST BRIEF:
- Topic: ${topic}
- Content type: ${content_type}
- Desired tone: ${tone || (campaign && campaign.brand_voice) || (brand && (brand.tone_of_voice || brand.preferred_tone)) || "clear, credible, helpful"}
- Selected platforms: ${platforms.join(", ")}
- Include hashtags: ${include_hashtags}
- Include image prompt: ${include_image_prompt}
- Include call to action: ${include_call_to_action}
- Custom instructions: ${custom_instructions || "—"}
${source_text ? `- Source material to summarize/adapt (do not fabricate beyond it):\n${source_text.slice(0, 4000)}` : ""}

PLATFORM RULES:
${platformRules(platforms)}

${focusInstruction}

SAFETY & QUALITY RULES (strict, non-negotiable):
- Never write spammy content.
- Never make fake claims. Never invent testimonials, statistics, or numbers.
- Never imply endorsement by any platform or third party.
- Flag in compliance_notes if Reddit content risks sounding like an ad, if Facebook copy sounds like engagement bait, or if Instagram captions are too hashtag-heavy.
- Respect each platform's tone and community norms.
- Honor the brand's banned/preferred words.
${include_image_prompt ? "- The image_prompt MUST follow: dark tech aesthetic, deep navy background (#0d1326 / #0a0f1e), glowing orange-to-red gradient accents (#f87171 → #fb923c → #facc15), minimal flat vector with subtle blueprint grid lines and soft glows, no text/logos/watermarks, high contrast, ample negative space." : ""}

OUTPUT:
- Fill platform_variants only for: ${platforms.join(", ")}.
- For each platform use these variant_label values in order: ${platforms.map((p) => `${p}: [${VARIANT_BLUEPRINT[p].join(", ")}]`).join(" | ")}.
- Provide global_hashtags, ${include_call_to_action ? "a single best cta, " : ""}${include_image_prompt ? "image_prompt + image_alt_text, " : ""}compliance_notes, a quality_checklist (5-8 checks with passed booleans), and a quality_score (0-100).
- title_internal is a short internal label (not published).`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "gpt_5_5",
      response_json_schema: buildResponseSchema(platforms),
    });

    // Persist as SocialPost records (one per platform) when requested.
    let savedPosts = [];
    if (save) {
      const approvalRequired = campaign ? campaign.approval_required !== false : true;
      const approvalStatus = approvalRequired ? "needs_review" : "draft";
      const pv = result.platform_variants || {};

      const toCreate = platforms.map((p) => {
        const variants = pv[p] || [];
        const first = variants[0] || {};
        const platformVariant = {};
        if (p === "twitter") {
          platformVariant.twitter_text = first.text || "";
          platformVariant.twitter_thread = first.thread || [];
        } else if (p === "reddit") {
          platformVariant.reddit_title = first.title || "";
          platformVariant.reddit_body = first.body || "";
        } else if (p === "linkedin") {
          platformVariant.linkedin_text = first.text || "";
        } else if (p === "facebook") {
          platformVariant.facebook_text = first.text || "";
          platformVariant.facebook_cta = first.cta || "";
          platformVariant.facebook_link_url = first.link_url || (campaign && campaign.landing_page_url) || "";
          platformVariant.facebook_post_type = first.post_type || "text";
        } else if (p === "instagram") {
          platformVariant.instagram_caption = first.caption || "";
          platformVariant.instagram_media_type = first.media_type || "image";
          platformVariant.instagram_alt_text = first.alt_text || result.image_alt_text || "";
          platformVariant.instagram_first_comment = first.first_comment || "";
          platformVariant.instagram_hashtags = first.hashtags || [];
        }

        return {
          account_id: "global",
          user_id: user.id,
          campaign_id: campaign_id || undefined,
          title_internal: result.title_internal || topic.slice(0, 80),
          content: first.text || first.body || first.caption || topic,
          platform_variants: platformVariant,
          hashtags: include_hashtags ? (first.hashtags || result.global_hashtags || []) : [],
          image_prompt: include_image_prompt ? (result.image_prompt || "") : "",
          image_alt_text: include_image_prompt ? (result.image_alt_text || "") : "",
          selected_platforms: [p],
          approval_status: approvalStatus,
          publishing_status: "unscheduled",
          ai_model_used: "gpt_5_5",
          ai_generation_input: topic,
          created_by: user.email,
        };
      });

      for (const rec of toCreate) {
        const created = await base44.entities.SocialPost.create(rec);
        savedPosts.push(created);
      }
    }

    // Log the generation event (sanitized).
    try {
      await base44.entities.SocialAutomationLog.create({
        account_id: "global",
        user_id: user.id,
        event_type: regenerate_target ? `content_regenerated_${regenerate_target}` : "content_generated",
        status: "success",
        related_campaign_id: campaign_id || undefined,
        message: `Generated content for ${platforms.join(", ")} — topic: ${topic.slice(0, 120)}`,
        metadata: {
          platforms,
          content_type,
          number_of_variations: number_of_variations || 3,
          saved: save,
          quality_score: result.quality_score,
        },
      });
    } catch (_logErr) {
      // logging is best-effort
    }

    return Response.json({ result, savedPosts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});