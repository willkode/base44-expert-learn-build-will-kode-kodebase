import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Mandatory brand rules — every generated image must follow these, regardless of style.
const BRAND_RULES =
  'Dark tech aesthetic on a deep navy background (#0d1326 / #0a0f1e). Glowing orange-to-red gradient accents transitioning through coral, orange, and amber (#f87171, #fb923c, #facc15). Minimal flat vector style with subtle blueprint grid lines and soft glows. Clean, modern, premium SaaS/developer-tool look. No logos, no watermarks. Consistent lighting, high contrast, ample negative space.';

// Styles are variations WITHIN the brand system — they never override the brand rules.
const IMAGE_STYLES = {
  brand: `${BRAND_RULES}`,
  photoreal: `Cinematic, dramatic moody lighting with realistic depth. ${BRAND_RULES}`,
  threeD: `Subtle 3D depth, glossy materials, soft studio lighting. ${BRAND_RULES}`,
  illustration: `Bold shapes and stylized scenes. ${BRAND_RULES}`,
  minimal: `Ultra-minimal abstract composition, simple geometric shapes, extra generous empty space. ${BRAND_RULES}`,
  isometric: `Isometric scene with clean lines. ${BRAND_RULES}`,
};

const styleFor = (key) => IMAGE_STYLES[key] || IMAGE_STYLES.brand;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { instructions, includeImage = true, imagePrompt, imageStyle } = await req.json();

    // Regenerate-image-only mode: caller already has a prompt.
    if (!instructions && imagePrompt) {
      const img = await base44.integrations.Core.GenerateImage({
        prompt: `${imagePrompt}. ${styleFor(imageStyle)}`,
      });
      return Response.json({ imageUrl: img.url, imagePrompt });
    }

    if (!instructions) {
      return Response.json({ error: 'instructions is required' }, { status: 400 });
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert social media copywriter for KodeBase, a premium developer-tool / vibe-coding brand that sells prompt packs, AI build tools, and services for people building apps with AI.

Write ONE ready-to-publish social media post based on these instructions from the marketing admin:

"""
${instructions}
"""

Rules:
- The caption must be complete and ready to paste — engaging hook in the first line, short punchy lines, and 3-6 relevant hashtags at the end.
- The hashtags MUST always include #Base44.
- Use emojis sparingly and only where they add energy.
- Do not use placeholder text, markdown formatting, or quotation marks around the caption.
- Also write a detailed image generation prompt (subject, composition, mood) that visually matches the post topic.`,
      response_json_schema: {
        type: 'object',
        properties: {
          caption: { type: 'string', description: 'The full ready-to-publish post caption' },
          image_prompt: { type: 'string', description: 'Detailed image generation prompt matching the post' },
        },
        required: ['caption', 'image_prompt'],
      },
    });

    // Guarantee the #Base44 hashtag is present even if the model omits it.
    let caption = result.caption || '';
    if (!/#base44\b/i.test(caption)) caption = `${caption.trimEnd()} #Base44`;

    let imageUrl = null;
    if (includeImage) {
      const img = await base44.integrations.Core.GenerateImage({
        prompt: `${result.image_prompt}. ${styleFor(imageStyle)}`,
      });
      imageUrl = img.url;
    }

    return Response.json({ caption, imagePrompt: result.image_prompt, imageUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});