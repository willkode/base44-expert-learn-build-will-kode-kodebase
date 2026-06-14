import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only. Takes the raw prompt input an admin enters, uses AI to optimize the
// post (description, guide, SEO meta) and generate a dark-tech featured image, then
// creates or updates the LibraryPrompt that powers /learn/prompt-library.
function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const id = body.id || null;
    const title = String(body.title || '').trim();
    const promptText = String(body.promptText || '').trim();
    const category = String(body.category || 'General').trim();
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const guideInput = String(body.guide || '').trim();
    const regenerateImage = !!body.regenerateImage;

    if (!title || !promptText) {
      return Response.json({ error: 'Title and prompt text are required.' }, { status: 400 });
    }

    // Unique slug
    let slug = slugify(body.slug || title);
    const clash = (await base44.asServiceRole.entities.LibraryPrompt.filter({ slug }))
      .filter((p) => p.id !== id);
    if (clash.length > 0) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    // 1) AI: optimize copy, guide, and SEO meta
    const ai = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an SEO copywriter for KodeBase, a developer tool for building Base44 apps.
Optimize a "Prompt Library" post. Keep it accurate to the prompt — do not invent features.

Title: ${title}
Category: ${category}
Tags: ${tags.join(', ') || 'none'}
Admin-written guide (may be empty): ${guideInput || '(none provided)'}
The prompt itself:
"""${promptText}"""

Return:
- description: one punchy sentence (max 160 chars) describing what the prompt does.
- guide: a well-formatted markdown how-to (200-400 words) explaining when and how to use this prompt, what to expect, and tips. Use headings and bullet points. If an admin guide was provided, refine and expand it rather than replacing its intent.
- seoTitle: a compelling SEO title under 60 chars, ending with " | KodeBase".
- seoDescription: a click-worthy meta description under 155 chars.
- imagePromptSubject: 3-6 words naming a concrete visual subject/metaphor for the featured image (e.g. "interlocking circuit blueprint nodes").`,
      response_json_schema: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          guide: { type: 'string' },
          seoTitle: { type: 'string' },
          seoDescription: { type: 'string' },
          imagePromptSubject: { type: 'string' },
        },
        required: ['description', 'guide', 'seoTitle', 'seoDescription'],
      },
    });

    // 2) Featured image — only on create or explicit regenerate
    let imageUrl = body.imageUrl || '';
    const existing = id ? await base44.asServiceRole.entities.LibraryPrompt.filter({ id }) : [];
    const prev = existing[0] || null;
    if (!imageUrl && prev?.imageUrl && !regenerateImage) {
      imageUrl = prev.imageUrl;
    }
    if (!imageUrl || regenerateImage) {
      const subject = ai.imagePromptSubject || `${category} concept`;
      const img = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: `${subject}. Dark tech aesthetic on a deep navy background (#0d1326 / #0a0f1e). Glowing orange-to-red gradient accents transitioning through coral, orange and amber (#f87171 to #fb923c to #facc15). Minimal flat vector style with subtle blueprint grid lines and soft glows. Clean, modern, premium SaaS / developer-tool look. No text, no logos, no watermarks. Consistent lighting, high contrast, ample negative space. Wide 16:9 composition.`,
      });
      imageUrl = img?.url || imageUrl;
    }

    const data = {
      title,
      slug,
      category,
      promptText,
      tags,
      description: ai.description || '',
      guide: ai.guide || guideInput || '',
      seoTitle: ai.seoTitle || `${title} | KodeBase`,
      seoDescription: ai.seoDescription || ai.description || '',
      imageUrl,
      featured: !!body.featured,
      order: typeof body.order === 'number' ? body.order : (prev?.order ?? 0),
    };

    const saved = id
      ? await base44.asServiceRole.entities.LibraryPrompt.update(id, data)
      : await base44.asServiceRole.entities.LibraryPrompt.create(data);

    return Response.json({ success: true, prompt: saved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});