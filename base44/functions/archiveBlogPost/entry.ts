import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await req.json();
    if (!id) return Response.json({ error: 'Post id is required.' }, { status: 400 });

    const Entity = base44.asServiceRole.entities.BlogPost;
    const matches = await Entity.filter({ id });
    if (!matches.length) return Response.json({ error: 'Post not found.' }, { status: 404 });

    const record = await Entity.update(id, {
      status: 'archived',
      published: false,
      lastUpdatedAt: new Date().toISOString(),
    });
    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'post_archived', relatedPostId: id, status: 'success',
      message: `Post "${matches[0].title}" archived by ${user.email}`,
    });
    return Response.json({ success: true, post: record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});