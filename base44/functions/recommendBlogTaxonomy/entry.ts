import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only. Recommends a category and tags for a blog post using the post's
// title/excerpt/content/keyword. The category is chosen from the existing
// BlogCategory list when possible (so it maps to a real categoryId); tags are
// short, lowercase, reusable terms. Returns suggestions only — it does not write
// to the post (the editor applies what the admin accepts).

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title = '',
      excerpt = '',
      content = '',
      targetKeyword = '',
      existingTags = [],
    } = body || {};

    if (!title.trim() && !content.trim()) {
      return Response.json({ error: 'Provide a title or content to analyze.' }, { status: 400 });
    }

    // Available categories (so we can recommend a real one when it fits).
    const categories = await base44.asServiceRole.entities.BlogCategory.list('displayOrder', 200);
    const categoryNames = categories.map((c) => c.name).filter(Boolean);

    // Existing tags across the blog, for reuse/consistency.
    let knownTags = [];
    try {
      const tagRows = await base44.asServiceRole.entities.BlogTag.list('name', 300);
      knownTags = tagRows.map((t) => t.name).filter(Boolean);
    } catch (_e) { /* tags optional */ }

    const trimmedContent = String(content || '').slice(0, 6000);

    const prompt = [
      'You are a blog content taxonomist. Given an article, recommend the single best category and 4-7 relevant tags.',
      categoryNames.length
        ? `Choose the category from this existing list when one fits well: ${categoryNames.join(', ')}. Only suggest a brand-new category name if none of these are a good fit.`
        : 'No existing categories yet — suggest a clear, broad category name.',
      knownTags.length ? `Prefer reusing these existing tags when relevant: ${knownTags.join(', ')}.` : '',
      'Tags must be short (1-3 words), lowercase, and reusable across articles. Avoid duplicating the category as a tag.',
      `Article title: "${title}".`,
      targetKeyword ? `Target keyword: "${targetKeyword}".` : '',
      excerpt ? `Excerpt: "${excerpt}".` : '',
      trimmedContent ? `Content:\n${trimmedContent}` : '',
    ].filter(Boolean).join('\n\n');

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Recommended category name' },
          categoryIsNew: { type: 'boolean', description: 'True if the category is not in the existing list' },
          tags: { type: 'array', items: { type: 'string' } },
          reason: { type: 'string', description: 'One short sentence explaining the choice' },
        },
        required: ['category', 'tags'],
      },
    });

    const recCategory = String(result?.category || '').trim();
    const matched = categories.find(
      (c) => (c.name || '').toLowerCase() === recCategory.toLowerCase()
    );

    // Clean + de-dupe tags, drop ones that equal the category, merge with existing.
    const rawTags = Array.isArray(result?.tags) ? result.tags : [];
    const seen = new Set((existingTags || []).map((t) => String(t).toLowerCase().trim()));
    const tags = [];
    for (const t of rawTags) {
      const clean = String(t || '').toLowerCase().trim();
      if (!clean || clean === recCategory.toLowerCase()) continue;
      if (seen.has(clean)) continue;
      seen.add(clean);
      tags.push(clean);
    }

    return Response.json({
      success: true,
      category: matched ? matched.name : recCategory,
      categoryId: matched ? matched.id : null,
      categoryIsNew: !matched,
      tags,
      reason: result?.reason || '',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});