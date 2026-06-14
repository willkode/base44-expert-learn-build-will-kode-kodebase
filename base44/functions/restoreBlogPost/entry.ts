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
    if (matches[0].status !== 'archived') {
      return Response.json({ error: 'Only archived posts can be restored.' }, { status: 400 });
    }

    // Restore to draft so it re-enters the normal review/publish flow.
    const record = await Entity.update(id, {
      status: 'draft',
      approvalStatus: 'draft',
      published: false,
      lastUpdatedAt: new Date().toISOString(),
    });
    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'post_restored', relatedPostId: id, status: 'success',
      message: `Post "${matches[0].title}" restored from archive by ${user.email}`,
    });
    return Response.json({ success: true, post: record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});