import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Supported aspect ratios per platform (the model renders to these intents).
const ASPECT_RATIOS = {
  "1:1": "a perfect 1:1 square composition",
  "16:9": "a 16:9 landscape composition with cinematic horizontal framing",
  "4:5": "a 4:5 portrait composition optimized for vertical feeds",
  "9:16": "a 9:16 tall vertical composition optimized for stories and reels",
};

const STYLE_GUIDANCE = {
  clean_saas: "a clean SaaS marketing graphic, structured and modern",
  bold_promo: "a bold promotional graphic with strong focal accents and energy",
  founder_authority: "a founder/authority style visual — confident, premium, editorial",
  minimal_branded: "a minimal branded graphic with lots of negative space",
  educational_carousel: "an educational carousel cover with a clear single focal concept",
  app_mockup: "a sleek abstract app interface mockup, no real readable UI text",
  abstract_tech: "an abstract technology visual with flowing geometric forms",
  community_discussion: "a friendly community discussion graphic, approachable and warm",
  product_launch: "a high-impact product launch graphic with a sense of momentum",
  facebook_promo: "a Facebook Page promo graphic, clear and social-friendly",
  instagram_reel_cover: "an Instagram Reel cover with a bold central focal point",
  instagram_carousel_cover: "an Instagram carousel cover with a single clear hook concept",
  instagram_story: "an Instagram Story graphic with a vertical, immersive composition",
};

// Provider abstraction: today we use Base44 Core.GenerateImage. To add OpenAI /
// Replicate / Stability later, implement another branch returning { url } and
// switch on `provider`.
async function generateWithProvider({ base44, provider, prompt }) {
  if (provider === "base44_core" || !provider) {
    const res = await base44.integrations.Core.GenerateImage({ prompt });
    return { url: res.url, model: "base44_core_image" };
  }
  throw new Error(`Unsupported image provider: ${provider}`);
}

function buildFinalPrompt({ basePrompt, style, aspectRatio, includeText, brandColors, brand, platform }) {
  const styleText = STYLE_GUIDANCE[style] || "a clean, professional social graphic";
  const aspectText = ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS["1:1"];
  const colors = (brandColors && brandColors.length ? brandColors : (brand && brand.brand_colors) || []);
  const colorText = colors.length
    ? `Incorporate these brand colors where natural: ${colors.join(", ")}.`
    : "";

  const textRule = includeText
    ? "You may include at most a few short, large, highly legible words — never paragraphs or small text."
    : "Do NOT place any text, words, letters, logos, or watermarks on the image.";

  return `${basePrompt}

Render this as ${styleText} for a ${platform} social post, composed as ${aspectText}.

VISUAL SYSTEM (strict):
- Dark tech aesthetic on a deep navy background (#0d1326 / #0a0f1e).
- Glowing orange-to-red gradient accents transitioning through coral, orange, and amber (#f87171 -> #fb923c -> #facc15).
- Minimal flat vector style with subtle blueprint grid lines and soft glows.
- Clean, modern, premium SaaS/developer-tool look. Consistent lighting, high contrast, ample negative space.
${colorText}

RULES:
- ${textRule}
- Avoid unreadable small text and cluttered detail.
- Avoid misleading visuals and any real copyrighted logos.
- Professional, high-contrast, accessible composition.`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const {
      social_post_id,
      image_prompt,
      platform = "general",
      image_style = "clean_saas",
      aspect_ratio = "1:1",
      include_text_on_image = false,
      brand_colors = [],
      logo_url = "",
      provider = "base44_core",
    } = body || {};

    if (!image_prompt || !image_prompt.trim()) {
      return Response.json({ error: "An image prompt is required." }, { status: 400 });
    }

    // Load brand profile for color/style context.
    const brands = await base44.entities.BrandProfile.filter({ account_id: "global" }, "-created_date", 1);
    const brand = brands && brands[0] ? brands[0] : null;

    // Load post + campaign when attached to a saved post.
    let post = null;
    let campaign = null;
    if (social_post_id) {
      try {
        post = await base44.entities.SocialPost.get(social_post_id);
        if (post && post.campaign_id) {
          campaign = await base44.entities.SocialCampaign.get(post.campaign_id);
        }
      } catch (_e) { /* ad-hoc generation continues without a saved post */ }
    }

    const finalPrompt = buildFinalPrompt({
      basePrompt: image_prompt,
      style: image_style,
      aspectRatio: aspect_ratio,
      includeText: include_text_on_image,
      brandColors: brand_colors,
      brand,
      platform,
    });

    const { url, model } = await generateWithProvider({ base44, provider, prompt: finalPrompt });

    // Accessible alt text derived from the prompt (no fabricated specifics).
    const altText = `Social graphic for ${platform}: ${image_prompt.slice(0, 160)}`;

    const providerMeta = {
      provider: provider || "base44_core",
      model,
      style: image_style,
      aspect_ratio,
      include_text_on_image,
      platform,
      brand_colors: brand_colors && brand_colors.length ? brand_colors : (brand && brand.brand_colors) || [],
      logo_url: logo_url || "",
      source: "ai",
      generated_at: new Date().toISOString(),
    };

    // Persist onto the SocialPost when one is attached.
    if (post) {
      await base44.entities.SocialPost.update(post.id, {
        image_url: url,
        image_prompt,
        image_alt_text: altText,
        image_provider_meta: providerMeta,
      });
    }

    // Log generation event (sanitized).
    try {
      await base44.entities.SocialAutomationLog.create({
        account_id: "global",
        user_id: user.id,
        event_type: "image_generated",
        platform: ["twitter", "reddit", "linkedin", "facebook", "instagram"].includes(platform) ? platform : undefined,
        related_post_id: social_post_id || undefined,
        related_campaign_id: (campaign && campaign.id) || undefined,
        status: "success",
        message: `Generated ${image_style} image (${aspect_ratio}) for ${platform}`,
        metadata: { style: image_style, aspect_ratio, provider: provider || "base44_core" },
      });
    } catch (_logErr) { /* best-effort */ }

    return Response.json({ image_url: url, image_alt_text: altText, image_provider_meta: providerMeta });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});