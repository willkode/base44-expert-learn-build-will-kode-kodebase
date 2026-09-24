import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Public endpoint — increments the view or copy counter on a LibraryPrompt.
// No auth required (public visitors can't write LibraryPrompt directly, so the
// increment runs as service role). Admin activity is not counted.

const COUNTERS = { view: 'viewCount', copy: 'copyCount' };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { slug, event } = await req.json();
    const field = COUNTERS[event];
    if (!slug || !field) {
      return Response.json({ success: false, error: 'slug and a valid event are required' }, { status: 400 });
    }

    const user = await base44.auth.me().catch(() => null);
    if (user?.role === 'admin') return Response.json({ success: true, skipped: 'admin' });

    const rows = await base44.asServiceRole.entities.LibraryPrompt.filter({ slug });
    const prompt = rows[0];
    if (!prompt) return Response.json({ success: true, skipped: 'not_found' });

    await base44.asServiceRole.entities.LibraryPrompt.update(prompt.id, {
      [field]: (prompt[field] || 0) + 1,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});
