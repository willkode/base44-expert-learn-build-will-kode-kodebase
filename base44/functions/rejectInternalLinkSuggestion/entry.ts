import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only. Marks an internal link suggestion as rejected.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { internal_link_id, reason = '' } = await req.json();
    if (!internal_link_id) return Response.json({ error: 'internal_link_id is required' }, { status: 400 });

    const Links = base44.asServiceRole.entities.BlogInternalLink;
    const rows = await Links.filter({ id: internal_link_id });
    const link = rows[0];
    if (!link) return Response.json({ error: 'Suggestion not found' }, { status: 404 });

    const updated = await Links.update(internal_link_id, { status: 'rejected' });

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'internal_link_rejected',
      relatedPostId: link.sourcePostId,
      status: 'success',
      message: `Rejected internal link suggestion${reason ? `: ${reason}` : ''}`,
      metadata: { targetPostId: link.targetPostId, reason },
    });

    return Response.json({ success: true, link: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});