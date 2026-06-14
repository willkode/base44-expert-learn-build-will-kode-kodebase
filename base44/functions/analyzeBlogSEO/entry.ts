import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Strip markdown to plain text for analysis.
function plainText(md) {
  return (md || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[(.*?)\]\(.*?\)/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#>*_~]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(text) {
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

const PLACEHOLDER_RE = /(lorem ipsum|tbd|todo|placeholder|xxx+|coming soon|insert .* here|\[.*?\])/i;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { blog_post_id } = await req.json();
    if (!blog_post_id) return Response.json({ error: 'blog_post_id is required' }, { status: 400 });

    const rows = await base44.asServiceRole.entities.BlogPost.filter({ id: blog_post_id });
    const post = rows[0];
    if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });

    const content = post.content || '';
    const md = content.toLowerCase();
    const text = plainText(content);
    const textLower = text.toLowerCase();
    const keyword = (post.targetKeyword || '').trim().toLowerCase();
    const words = countWords(text);

    const passed = [];
    const warnings = [];
    const critical = [];

    const pass = (label) => passed.push(label);
    const warn = (label) => warnings.push(label);
    const crit = (label) => critical.push(label);

    // --- Title ---
    if (post.title && post.title.trim()) pass('Title is present');
    else crit('Title is missing');

    if (keyword) {
      if (post.title && post.title.toLowerCase().includes(keyword)) pass('Title includes the target keyword');
      else warn('Title does not include the target keyword');
    } else {
      warn('No target keyword set — keyword checks skipped');
    }

    // --- Slug ---
    if (post.slug && /^[a-z0-9-]+$/.test(post.slug)) {
      if (post.slug.length <= 60) pass('Slug is clean and readable');
      else warn('Slug is quite long — shorter slugs read better');
    } else {
      crit('Slug is missing or invalid');
    }

    // --- Meta title ---
    if (post.metaTitle && post.metaTitle.trim()) {
      pass('Meta title is present');
      if (post.metaTitle.length > 60) warn('Meta title is over 60 characters and may be truncated');
      else pass('Meta title length is within range');
    } else {
      warn('Meta title is missing');
    }

    // --- Meta description ---
    if (post.metaDescription && post.metaDescription.trim()) {
      pass('Meta description is present');
      const len = post.metaDescription.length;
      if (len < 70) warn('Meta description is short — aim for 120–160 characters');
      else if (len > 160) warn('Meta description is over 160 characters and may be truncated');
      else pass('Meta description length is optimal');
    } else {
      warn('Meta description is missing');
    }

    // --- Keyword usage ---
    if (keyword) {
      const occurrences = textLower.split(keyword).length - 1;
      if (occurrences === 0) warn('Target keyword does not appear in the content');
      else pass('Target keyword appears in the content');
      const density = words ? occurrences / words : 0;
      if (density > 0.03) warn('Target keyword may be overused (keyword stuffing)');
      else if (occurrences > 0) pass('Keyword density looks natural');
    }

    // --- Heading structure ---
    const h2h3 = (content.match(/^#{2,3}\s+/gm) || []).length;
    if (h2h3 >= 2) pass('Clear H2/H3 heading structure');
    else warn('Add more H2/H3 subheadings to structure the content');

    // --- Intro / search intent ---
    const intro = textLower.slice(0, 350);
    if (keyword && intro.includes(keyword)) pass('Intro mentions the keyword and addresses intent');
    else if (text.length > 0) warn('Make the intro clearly answer the search intent early');

    // --- Content length ---
    if (words >= 600) pass('Content length is appropriate');
    else if (words >= 300) warn('Content is a bit thin — aim for 600+ words');
    else crit('Content is too short or empty');

    // --- Links ---
    const internalLinks = (content.match(/\]\((\/|#)/g) || []).length;
    const externalLinks = (content.match(/\]\(https?:\/\//g) || []).length;
    if (internalLinks > 0) pass('Internal links are present');
    else warn('Add internal links to related content');
    if (externalLinks > 0) pass('External links are present');
    else warn('Consider adding external references where useful');

    // --- Featured image ---
    if (post.coverImageUrl) pass('Featured image is set');
    else warn('Add a featured image');
    if (post.coverImageUrl) {
      if (post.featuredImageAlt && post.featuredImageAlt.trim()) pass('Featured image has alt text');
      else warn('Add alt text to the featured image');
    }

    // --- FAQ ---
    if (/faq|frequently asked|\bq:|\bq&a\b/i.test(md)) pass('FAQ section detected');
    else warn('Consider adding an FAQ section if useful');

    // --- CTA ---
    if (/\b(get started|sign up|try|learn more|download|subscribe|book|contact|start (free|now))\b/i.test(textLower)) {
      pass('A call-to-action is present');
    } else {
      warn('Add a clear call-to-action');
    }

    // --- Readability ---
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgWords = sentences.length ? words / sentences.length : 0;
    if (avgWords > 0 && avgWords <= 22) pass('Readability is acceptable (short sentences)');
    else if (avgWords > 22) warn('Sentences are long — shorten for better readability');

    // --- Quality / hygiene ---
    if (PLACEHOLDER_RE.test(content)) crit('Placeholder text detected — remove before publishing');
    else pass('No placeholder text detected');

    const emptySections = (content.match(/^#{1,3}\s+.+\n+(#{1,3}\s+|\s*$)/gm) || []).length;
    if (emptySections > 0) warn('Some sections appear empty — add content under each heading');
    else pass('No obviously empty sections');

    // --- Score ---
    const total = passed.length + warnings.length + critical.length;
    let score = total ? Math.round((passed.length / total) * 100) : 0;
    score = Math.max(0, score - critical.length * 12);

    let status = 'poor';
    if (score >= 85 && critical.length === 0) status = 'excellent';
    else if (score >= 70 && critical.length === 0) status = 'good';
    else if (score >= 50) status = 'fair';

    const result = {
      score,
      status,
      passed,
      warnings,
      critical_issues: critical,
      recommendations: [...critical, ...warnings],
    };

    await base44.asServiceRole.entities.BlogPost.update(blog_post_id, {
      seoScore: score,
      revisionNotes: post.revisionNotes,
    });

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'seo_analysis',
      relatedPostId: blog_post_id,
      status: critical.length ? 'warning' : 'success',
      message: `SEO analyzed — score ${score} (${status})`,
      metadata: { score, status, criticalCount: critical.length, warningCount: warnings.length },
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});