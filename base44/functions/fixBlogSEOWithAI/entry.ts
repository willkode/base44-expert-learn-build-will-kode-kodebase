import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Maps each fix action to an instruction + which field(s) it updates.
const FIX_TASKS = {
  improve_title: { field: 'title', instruction: 'Rewrite the post title so it is compelling, clear, and naturally includes the target keyword. Keep it under 65 characters.' },
  improve_meta_description: { field: 'metaDescription', instruction: 'Write a meta description of 120–160 characters that is clear, includes the target keyword naturally, and maximizes click-through.' },
  improve_intro: { field: 'content', instruction: 'Rewrite ONLY the introduction (the first 1–2 paragraphs before the first heading) so it immediately answers the search intent and includes the target keyword naturally. Return the full post content with the improved intro and everything else unchanged.' },
  add_faq: { field: 'content', instruction: 'Append a clear "## FAQ" section near the end of the post with 3–5 relevant questions and concise answers based on the topic. Return the full updated content.' },
  add_cta: { field: 'content', instruction: 'Add a short, natural call-to-action paragraph near the end of the post encouraging the reader to take the next step. Return the full updated content.' },
  improve_headings: { field: 'content', instruction: 'Improve the heading structure using clear H2/H3 markdown headings to organize the content logically. Do not remove information. Return the full updated content.' },
  reduce_keyword_stuffing: { field: 'content', instruction: 'Rewrite the content to reduce keyword over-use so it reads naturally, keeping the meaning and length similar. Return the full updated content.' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { blog_post_id, action } = await req.json();
    const task = FIX_TASKS[action];
    if (!blog_post_id || !task) return Response.json({ error: 'blog_post_id and a valid action are required' }, { status: 400 });

    const rows = await base44.asServiceRole.entities.BlogPost.filter({ id: blog_post_id });
    const post = rows[0];
    if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });

    const prompt = `You are an expert SEO editor for a developer-tools blog.
Target keyword: "${post.targetKeyword || '(none)'}"
Post title: "${post.title || ''}"

Task: ${task.instruction}

Current content:
"""
${task.field === 'content' ? (post.content || '') : (post[task.field] || '')}
"""

Return ONLY the new value for the field, no commentary, no code fences.`;

    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: { value: { type: 'string' } },
        required: ['value'],
      },
    });

    const value = (llmRes?.value || '').trim();
    if (!value) return Response.json({ error: 'AI returned an empty result' }, { status: 502 });

    await base44.asServiceRole.entities.BlogPost.update(blog_post_id, { [task.field]: value });

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'seo_fix',
      relatedPostId: blog_post_id,
      status: 'success',
      message: `Applied SEO fix: ${action}`,
      metadata: { action, field: task.field },
    });

    return Response.json({ success: true, field: task.field, value });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});