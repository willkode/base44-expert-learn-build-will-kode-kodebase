import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only. Recommends a category and tags for a blog post using the post's
// title/excerpt/content/keyword. The category is chosen from the existing
// BlogCategory list when possible; if none fits, a new BlogCategory is created
// so the editor can auto-select it. Recommended tags that don't exist yet are
// created as BlogTag records too. Returns the resolved category (with a real
// categoryId) and the final tag list.

const MAX = 60;
function slugify(input) {
  let s = (input || '').toString().toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (s.length > MAX) s = s.slice(0, MAX).replace(/-+$/g, '');
  return s;
}
async function uniqueSlug(Entity, base) {
  let slug = base, n = 1;
  while (true) {
    const m = await Entity.filter({ slug });
    if (m.length === 0) break;
    n += 1; slug = `${base}-${n}`;
  }
  return slug;
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
      title = '',
      excerpt = '',
      content = '',
      targetKeyword = '',
      existingTags = [],
    } = body || {};

    if (!title.trim() && !content.trim()) {
      return Response.json({ error: 'Provide a title or content to analyze.' }, { status: 400 });
    }

    const Categories = base44.asServiceRole.entities.BlogCategory;
    const Tags = base44.asServiceRole.entities.BlogTag;

    // Available categories (so we can recommend a real one when it fits).
    const categories = await Categories.list('displayOrder', 200);
    const categoryNames = categories.map((c) => c.name).filter(Boolean);

    // Existing tags across the blog, for reuse/consistency.
    let knownTagRecords = [];
    try {
      knownTagRecords = await Tags.list('name', 300);
    } catch (_e) { /* tags optional */ }
    const knownTagNames = knownTagRecords.map((t) => t.name).filter(Boolean);

    const trimmedContent = String(content || '').slice(0, 6000);

    const prompt = [
      'You are a blog content taxonomist. Given an article, recommend the single best category and 4-7 relevant tags.',
      categoryNames.length
        ? `Choose the category from this existing list when one fits well: ${categoryNames.join(', ')}. Only suggest a brand-new category name if none of these are a good fit.`
        : 'No existing categories yet — suggest a clear, broad category name.',
      knownTagNames.length ? `Prefer reusing these existing tags when relevant: ${knownTagNames.join(', ')}.` : '',
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
          tags: { type: 'array', items: { type: 'string' } },
          reason: { type: 'string', description: 'One short sentence explaining the choice' },
        },
        required: ['category', 'tags'],
      },
    });

    const recCategory = String(result?.category || '').trim();

    // Resolve the category: match an existing one, or create it.
    let categoryRecord = categories.find(
      (c) => (c.name || '').toLowerCase() === recCategory.toLowerCase()
    );
    let categoryCreated = false;
    if (!categoryRecord && recCategory) {
      const base = slugify(recCategory);
      const slug = await uniqueSlug(Categories, base || 'category');
      categoryRecord = await Categories.create({ name: recCategory, slug, isActive: true });
      categoryCreated = true;
      await base44.asServiceRole.entities.BlogAutomationLog.create({
        eventType: 'category_created', status: 'success',
        message: `Category "${categoryRecord.name}" auto-created from AI recommendation by ${user.email}`,
        metadata: { categoryId: categoryRecord.id, slug },
      });
    }

    // Clean + de-dupe recommended tags (drop the category, drop already-present tags).
    const rawTags = Array.isArray(result?.tags) ? result.tags : [];
    const seen = new Set((existingTags || []).map((t) => String(t).toLowerCase().trim()));
    const recommendedTags = [];
    for (const t of rawTags) {
      const clean = String(t || '').toLowerCase().trim();
      if (!clean || clean === recCategory.toLowerCase()) continue;
      if (seen.has(clean)) continue;
      seen.add(clean);
      recommendedTags.push(clean);
    }

    // Create any recommended tags that don't already exist as BlogTag records.
    const knownTagLower = new Set(knownTagNames.map((n) => n.toLowerCase()));
    let tagsCreated = 0;
    for (const name of recommendedTags) {
      if (knownTagLower.has(name)) continue;
      try {
        const base = slugify(name);
        if (!base) continue;
        const slug = await uniqueSlug(Tags, base);
        await Tags.create({ name, slug, isActive: true });
        knownTagLower.add(name);
        tagsCreated += 1;
      } catch (_e) { /* skip tag creation failures, still return the name */ }
    }
    if (tagsCreated > 0) {
      await base44.asServiceRole.entities.BlogAutomationLog.create({
        eventType: 'tag_created', status: 'success',
        message: `${tagsCreated} tag(s) auto-created from AI recommendation by ${user.email}`,
        metadata: { count: tagsCreated },
      });
    }

    return Response.json({
      success: true,
      category: categoryRecord ? categoryRecord.name : recCategory,
      categoryId: categoryRecord ? categoryRecord.id : null,
      categoryCreated,
      tags: recommendedTags,
      tagsCreated,
      reason: result?.reason || '',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});