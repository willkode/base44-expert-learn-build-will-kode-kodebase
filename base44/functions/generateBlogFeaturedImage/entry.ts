import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only AI featured image generation for blog posts.
// Builds a brand/style-aware prompt, generates an image via the active provider,
// stores the URL + provider metadata + accessible alt text on the BlogPost, and logs the event.
//
// Provider abstraction: today only the built-in Base44 Core.GenerateImage is wired up.
// To add OpenAI / Replicate / Stability later, add a branch in generateWithProvider()
// keyed off a provider id (e.g. from BlogSettings) — the rest of the flow stays the same.

const STYLE_GUIDES = {
  'Clean SaaS blog graphic':
    'Clean modern SaaS blog graphic, minimal flat vector illustration, premium developer-tool look, ample negative space.',
  'Editorial illustration':
    'Editorial illustration style, conceptual and metaphorical, flat vector shapes, magazine-quality composition.',
  'Abstract technology visual':
    'Abstract technology visual, geometric shapes, flowing gradients, data/network motifs, no literal objects.',
  'Product education graphic':
    'Product education graphic, clear conceptual diagram feel, simple icons and shapes, instructional and tidy.',
  'Minimal branded graphic':
    'Minimal branded graphic, single strong focal subject, lots of negative space, restrained and elegant.',
  'Founder/thought leadership graphic':
    'Thought-leadership graphic, confident and aspirational, abstract leadership/vision motifs, premium and calm.',
  'Tutorial cover image':
    'Tutorial cover image, friendly and approachable, step/process motifs, clean instructional composition.',
  'Comparison article cover':
    'Comparison article cover, balanced split/versus composition, two contrasting sides, clear visual balance.',
  'Local business image':
    'Local business themed image, approachable community feel, simple flat vector scene, warm and trustworthy.',
  'Newsletter-style cover':
    'Newsletter-style cover graphic, header-banner composition, inviting and editorial, clean and modern.',
};

// Default house style (matches the app's dark tech aesthetic).
const BRAND_STYLE =
  'Dark tech aesthetic on a deep navy background (#0d1326 / #0a0f1e). Glowing orange-to-red gradient accents transitioning through coral, orange and amber (#f87171 to #fb923c to #facc15). Subtle blueprint grid lines and soft glows. Clean, modern, premium SaaS/developer-tool look. Consistent lighting, high contrast, ample negative space.';

const ASPECT_GUIDE = {
  '16:9': 'wide 16:9 horizontal composition',
  '4:3': '4:3 landscape composition',
  '1:1': 'square 1:1 composition',
  '3:2': '3:2 landscape composition',
};

const ALLOWED_RATIOS = ['16:9', '4:3', '1:1', '3:2'];

async function generateWithProvider(base44, finalPrompt) {
  // Single provider for now: Base44 Core.GenerateImage.
  const img = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt: finalPrompt });
  return {
    url: img?.url || '',
    provider: 'base44_core',
    model: 'core_generate_image',
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      blog_post_id,
      image_prompt = '',
      image_style = 'Clean SaaS blog graphic',
      aspect_ratio = '16:9',
      include_brand_colors = true,
      include_logo = false,
    } = body || {};

    if (!blog_post_id) {
      return Response.json({ error: 'blog_post_id is required.' }, { status: 400 });
    }
    const ratio = ALLOWED_RATIOS.includes(aspect_ratio) ? aspect_ratio : '16:9';

    // Load the post.
    const postRows = await base44.asServiceRole.entities.BlogPost.filter({ id: blog_post_id });
    const post = postRows[0];
    if (!post) {
      return Response.json({ error: 'Blog post not found.' }, { status: 404 });
    }

    // Load settings + optional brand profile (BrandProfile is optional — used if it exists later).
    const settingsRows = await base44.asServiceRole.entities.BlogSettings.filter({ key: 'global' });
    const settings = settingsRows[0] || {};

    let brand = null;
    try {
      if (base44.asServiceRole.entities.BrandProfile) {
        const brandRows = await base44.asServiceRole.entities.BrandProfile.list('-created_date', 1);
        brand = brandRows[0] || null;
      }
    } catch (_e) { /* no BrandProfile entity — fine */ }

    if (settings.enableAiImageGeneration === false) {
      return Response.json({ error: 'AI image generation is disabled in blog settings.' }, { status: 400 });
    }

    // Determine the subject of the image.
    const subject = String(image_prompt || post.featuredImagePrompt || post.title || 'blog cover concept').trim();
    const styleGuide = STYLE_GUIDES[image_style] || STYLE_GUIDES['Clean SaaS blog graphic'];
    const aspectGuide = ASPECT_GUIDE[ratio] || ASPECT_GUIDE['16:9'];

    // Brand colors: from BrandProfile if present, else the app house style.
    const brandColorText = include_brand_colors
      ? (brand?.brandColors || settings.defaultFeaturedImageStyle || BRAND_STYLE)
      : 'Tasteful professional color palette suitable for a blog cover.';

    const logoRule = include_logo
      ? 'A simple, generic brand mark may appear subtly — never a real-world copyrighted logo.'
      : 'No logos or watermarks of any kind.';

    const finalPrompt = [
      `Professional blog cover image. ${styleGuide}`,
      `Subject: ${subject}.`,
      brandColorText,
      `Composition: ${aspectGuide}.`,
      'Image rules: avoid text in the image; never include unreadable small text; no copyrighted logos.',
      logoRule,
      'Prefer a clean, premium, professional blog cover visual.',
    ].filter(Boolean).join(' ');

    // Generate.
    const result = await generateWithProvider(base44, finalPrompt);
    if (!result.url) {
      return Response.json({ error: 'Image generation returned no URL. Please try again.' }, { status: 502 });
    }

    // Accessible alt text (descriptive, concise, no "image of").
    let altText = post.featuredImageAlt || '';
    try {
      const altRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Write concise, accessible alt text (max 125 characters) for a blog cover image. Describe the visual content meaningfully for screen readers. Do not start with "image of" or "picture of". Article title: "${post.title}". Visual subject: "${subject}".`,
        response_json_schema: {
          type: 'object',
          properties: { alt_text: { type: 'string' } },
          required: ['alt_text'],
        },
      });
      if (altRes?.alt_text) altText = String(altRes.alt_text).slice(0, 160);
    } catch (_e) {
      if (!altText) altText = `${post.title} — cover image`;
    }

    const providerMeta = {
      provider: result.provider,
      model: result.model,
      style: image_style,
      aspectRatio: ratio,
      includeBrandColors: !!include_brand_colors,
      includeLogo: !!include_logo,
      prompt: finalPrompt.slice(0, 2000),
      generatedAt: new Date().toISOString(),
      generatedBy: user.email,
    };

    // Store on the post.
    const updated = await base44.asServiceRole.entities.BlogPost.update(blog_post_id, {
      coverImageUrl: result.url,
      ogImageUrl: post.ogImageUrl || result.url,
      twitterImageUrl: post.twitterImageUrl || result.url,
      featuredImageAlt: altText,
      featuredImagePrompt: subject,
      imageProviderMeta: providerMeta,
      lastUpdatedAt: new Date().toISOString(),
    });

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'generate_image',
      relatedPostId: blog_post_id,
      status: 'success',
      message: `Featured image generated for "${post.title}" by ${user.email}`,
      metadata: providerMeta,
    });

    return Response.json({
      success: true,
      imageUrl: result.url,
      altText,
      featuredImagePrompt: subject,
      providerMeta,
      post: updated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});