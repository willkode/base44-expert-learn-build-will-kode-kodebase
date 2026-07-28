import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const BASE = 'https://app.ocoya.com/api/_public/v1';

async function ocoya(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'X-API-Key': Deno.env.get('OCOYA_API_KEY') || '',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) {
    const detail = data?.message || data?.error || (data ? JSON.stringify(data).slice(0, 300) : '');
    throw new Error(detail ? `Ocoya API error (${res.status}): ${detail}` : `Ocoya API error (${res.status})`);
  }
  return data;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const {
      workspaceId,
      dryRun = false,
      spacingMinutes = 30,
      startOffsetMinutes = 30,
      deleteOriginals = true,
    } = await req.json();
    if (!workspaceId) return Response.json({ error: 'workspaceId is required' }, { status: 400 });
    const ws = encodeURIComponent(workspaceId);

    // Collect every post in the workspace.
    const all = [];
    for (let page = 1; page <= 20; page++) {
      const batch = await ocoya(`/post?workspaceId=${ws}&page=${page}&perPage=50`);
      const list = Array.isArray(batch) ? batch : (batch?.data || []);
      if (!list.length) break;
      all.push(...list);
      if (list.length < 50) break;
    }

    // Stuck posts that were meant to include LinkedIn.
    const targets = all
      .filter((p) => p.status === 'NEEDS_ATTENTION')
      .map((p) => {
        const linkedInProfile = (p.socialProfiles || [])
          .map((sp) => sp.socialProfile)
          .find((sp) => sp?.provider === 'linkedin');
        const channel =
          (p.posts || []).find((x) => x.provider === 'LINKEDIN') ||
          (p.posts || []).find((x) => x.provider === 'GENERAL');
        const caption = channel?.options?.caption || channel?.caption || '';
        const mediaUrls = (channel?.creatives || [])
          .map((c) => c.video || c.image)
          .filter(Boolean);
        return { id: p.id, scheduledAt: p.scheduledAt, linkedInProfile, caption, mediaUrls };
      })
      .filter((t) => t.linkedInProfile && (t.caption || t.mediaUrls.length))
      .sort((a, b) => new Date(a.scheduledAt || 0) - new Date(b.scheduledAt || 0));

    // Original slots are in the past, so lay them back out from now, in order.
    const startMs = Date.now() + startOffsetMinutes * 60 * 1000;
    const plan = targets.map((t, i) => ({
      ...t,
      newScheduledAt: new Date(startMs + i * spacingMinutes * 60 * 1000).toISOString(),
    }));

    if (dryRun) {
      return Response.json({
        dryRun: true,
        totalPosts: all.length,
        stuckLinkedInPosts: plan.length,
        preview: plan.slice(0, 5).map((p) => ({
          originalId: p.id,
          profile: p.linkedInProfile.name,
          wasScheduledAt: p.scheduledAt,
          newScheduledAt: p.newScheduledAt,
          media: p.mediaUrls.length,
          captionPreview: p.caption.slice(0, 80),
        })),
      });
    }

    const recreated = [];
    const failures = [];
    for (const p of plan) {
      try {
        const body = {
          caption: p.caption,
          socialProfileIds: [p.linkedInProfile.id],
          scheduledAt: p.newScheduledAt,
        };
        if (p.mediaUrls.length) body.mediaUrls = p.mediaUrls;
        const created = await ocoya(`/post?workspaceId=${ws}`, { method: 'POST', body });
        if (deleteOriginals) {
          await ocoya(`/post/${encodeURIComponent(p.id)}`, { method: 'DELETE' });
        }
        recreated.push({
          originalId: p.id,
          newId: created?.id || null,
          profile: p.linkedInProfile.name,
          scheduledAt: p.newScheduledAt,
        });
      } catch (e) {
        failures.push({ originalId: p.id, error: e.message });
      }
    }

    return Response.json({
      success: true,
      totalPosts: all.length,
      stuckLinkedInPosts: plan.length,
      recreatedCount: recreated.length,
      recreated,
      failures,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});