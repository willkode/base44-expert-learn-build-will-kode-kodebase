import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const BRAND_PALETTE =
  'Deep navy background (#0d1326 / #0a0f1e) with glowing orange-to-red gradient accents transitioning through coral, orange, and amber (#f87171, #fb923c, #facc15). No text, no logos, no watermarks. Consistent lighting, high contrast, ample negative space.';

const IMAGE_STYLES = {
  brand: `Dark tech aesthetic. Minimal flat vector style with subtle blueprint grid lines and soft glows. Clean, modern, premium SaaS/developer-tool look. ${BRAND_PALETTE}`,
  photoreal: `Photorealistic, cinematic photography style with dramatic moody lighting. ${BRAND_PALETTE}`,
  threeD: `Premium 3D render, glossy materials, soft studio lighting, depth of field. ${BRAND_PALETTE}`,
  illustration: `Detailed digital illustration, bold shapes, stylized characters and scenes. ${BRAND_PALETTE}`,
  minimal: `Ultra-minimal abstract composition, simple geometric shapes, generous empty space. ${BRAND_PALETTE}`,
  isometric: `Isometric flat design scene with clean lines, subtle blueprint grid, soft glows. ${BRAND_PALETTE}`,
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

    let imageUrl = null;
    if (includeImage) {
      const img = await base44.integrations.Core.GenerateImage({
        prompt: `${result.image_prompt}. ${styleFor(imageStyle)}`,
      });
      imageUrl = img.url;
    }

    return Response.json({ caption: result.caption, imagePrompt: result.image_prompt, imageUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});