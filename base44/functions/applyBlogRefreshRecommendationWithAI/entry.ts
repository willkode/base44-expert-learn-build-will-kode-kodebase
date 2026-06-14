import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Maps a recommendation type -> which post field it updates + AI instruction.
// `content`-field tasks return the FULL updated markdown; others return just the field value.
const TYPE_TASKS = {
  update_title: { field: 'title', instruction: 'Rewrite the post title so it is compelling, clear, and naturally includes the target keyword. 40–65 characters, no quotes.' },
  update_meta: { field: 'metaDescription', instruction: 'Write a meta description of 120–160 characters that includes the target keyword naturally and maximizes click-through.' },
  improve_intro: { field: 'content', instruction: 'Rewrite ONLY the introduction (first 1–2 paragraphs before the first heading) so it immediately answers search intent and includes the target keyword. Return the FULL post content with the improved intro and everything else unchanged.' },
  add_section: { field: 'content', instruction: 'Add one valuable new "##" section in a logical place that deepens the topic. Do not remove anything. Return the FULL updated content.' },
  expand_content: { field: 'content', instruction: 'Expand the post with deeper, more useful detail and examples across existing sections, and add a "## FAQ" with 3–5 Q&As if missing. Do not remove information. Return the FULL updated content.' },
  add_cta: { field: 'content', instruction: 'Add a short, natural call-to-action paragraph near the end pointing the reader to the next step. Return the FULL updated content.' },
  add_internal_links: { field: 'content', instruction: 'Weave in 2–4 contextual internal links using markdown to related guides and product pages (use plausible /learn/blog/ and /products paths). Return the FULL updated content.' },
  refresh_stats: { field: 'content', instruction: 'Update date-sensitive language, years, and stats so the post reads as current, keeping meaning and structure. Return the FULL updated content.' },
  improve_readability: { field: 'content', instruction: 'Improve readability: shorter sentences, clearer headings, bullet lists where helpful. Do not remove information. Return the FULL updated content.' },
  fix_decay: { field: 'content', instruction: 'Refresh the whole post: stronger intro, updated examples and stats, clearer headings, an FAQ if missing, and a CTA. Return the FULL updated content.' },
};

// Cap stored content to avoid entity field overflow.
const MAX_CONTENT = 9500;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { recommendation_id } = await req.json();
    if (!recommendation_id) return Response.json({ error: 'recommendation_id is required' }, { status: 400 });

    const svc = base44.asServiceRole;

    const rec = await svc.entities.BlogContentRefreshRecommendation.get(recommendation_id);
    if (!rec) return Response.json({ error: 'Recommendation not found' }, { status: 404 });

    const post = await svc.entities.BlogPost.get(rec.blogPostId);
    if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });

    const task = TYPE_TASKS[rec.recommendationType];
    if (!task) {
      // Manual-only recommendation types (consolidate/split/new keyword/featured image).
      await svc.entities.BlogContentRefreshRecommendation.update(recommendation_id, { status: 'in_progress' });
      return Response.json({ success: true, applied: false, manual: true, message: 'This recommendation needs manual review and was marked in progress.' });
    }

    const sourceValue = task.field === 'content' ? (post.content || '') : (post[task.field] || '');

    const prompt = `You are an expert SEO content editor for a developer-tools blog (dark, technical, premium voice).
Target keyword: "${post.targetKeyword || '(none)'}"
Post title: "${post.title || ''}"
Refresh reason: ${rec.reason || ''}
Suggested changes: ${rec.suggestedChanges || ''}

Task: ${task.instruction}

Current ${task.field}:
"""
${sourceValue}
"""

Return ONLY the new value for the field, no commentary, no code fences.`;

    const llmRes = await svc.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_5',
      response_json_schema: { type: 'object', properties: { value: { type: 'string' } }, required: ['value'] },
    });

    let value = (llmRes?.value || '').trim();
    if (!value) return Response.json({ error: 'AI returned an empty result' }, { status: 502 });
    if (task.field === 'content' && value.length > MAX_CONTENT) {
      const cut = value.lastIndexOf('\n', MAX_CONTENT);
      value = value.slice(0, cut > 0 ? cut : MAX_CONTENT);
    }

    // Save as a DRAFT revision — never auto-publish. Move the post to needs_review.
    const update = {
      [task.field]: value,
      status: 'needs_review',
      approvalStatus: 'revision_requested',
      revisionNotes: `AI refresh applied (${rec.recommendationType}). Review before re-publishing.`,
      lastUpdatedAt: new Date().toISOString(),
    };
    if (task.field === 'content') {
      const plain = value.replace(/[#*`_>]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
      update.contentPlainText = plain.slice(0, MAX_CONTENT);
      update.wordCount = plain.split(/\s+/).filter(Boolean).length;
    }
    await svc.entities.BlogPost.update(post.id, update);

    await svc.entities.BlogContentRefreshRecommendation.update(recommendation_id, { status: 'applied' });

    await svc.entities.BlogAutomationLog.create({
      eventType: 'refresh_apply',
      relatedPostId: post.id,
      status: 'success',
      message: `Applied AI refresh (${rec.recommendationType}) to "${post.title}" as a draft revision.`,
      metadata: { recommendationId: recommendation_id, field: task.field, type: rec.recommendationType },
    });

    return Response.json({ success: true, applied: true, field: task.field, value, postId: post.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});