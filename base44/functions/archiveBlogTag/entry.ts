import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Soft archive/restore a tag by toggling isActive. Defaults to deactivate.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { id, isActive = false } = await req.json();
    if (!id) return Response.json({ error: 'Tag id is required.' }, { status: 400 });

    const record = await base44.asServiceRole.entities.BlogTag.update(id, { isActive });
    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: isActive ? 'tag_restored' : 'tag_archived', status: 'success',
      message: `Tag "${record.name}" ${isActive ? 'restored' : 'archived'} by ${user.email}`,
      metadata: { tagId: id },
    });
    return Response.json({ success: true, tag: record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});