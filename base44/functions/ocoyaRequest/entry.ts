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

    const { action, workspaceId, ...params } = await req.json();

    if (action === 'me') {
      return Response.json(await ocoya('/me'));
    }

    if (action === 'workspaces') {
      return Response.json(await ocoya('/workspaces'));
    }

    if (!workspaceId) {
      return Response.json({ error: 'workspaceId is required' }, { status: 400 });
    }
    const ws = encodeURIComponent(workspaceId);

    if (action === 'profiles') {
      return Response.json(await ocoya(`/social-profiles?workspaceId=${ws}`));
    }

    if (action === 'listPosts') {
      const qs = new URLSearchParams({ workspaceId });
      if (params.page != null) qs.set('page', String(params.page));
      qs.set('perPage', String(params.perPage || 25));
      let url = `/post?${qs.toString()}`;
      for (const s of params.statuses || []) url += `&statuses=${encodeURIComponent(s)}`;
      return Response.json(await ocoya(url));
    }

    if (action === 'createPost') {
      const { caption, mediaUrls, socialProfileIds, scheduledAt } = params;
      if (!caption && !(mediaUrls || []).length) {
        return Response.json({ error: 'A caption or media is required' }, { status: 400 });
      }
      const base = {};
      if (caption) base.caption = caption;
      if (mediaUrls?.length) base.mediaUrls = mediaUrls;
      if (scheduledAt) base.scheduledAt = scheduledAt;

      // One Ocoya post per social profile: a bundle addressed to several
      // channels is validated as a group, so a single unhealthy channel
      // parks every other channel in NEEDS_ATTENTION.
      const profileIds = socialProfileIds?.length ? socialProfileIds : [null];
      const created = [];
      const failures = [];
      for (const profileId of profileIds) {
        const body = { ...base };
        if (profileId) body.socialProfileIds = [profileId];
        try {
          const result = await ocoya(`/post?workspaceId=${ws}`, { method: 'POST', body });
          created.push({ socialProfileId: profileId, post: result || null });
        } catch (e) {
          failures.push({ socialProfileId: profileId, error: e.message });
        }
      }
      if (!created.length) {
        return Response.json({ error: failures[0]?.error || 'Ocoya rejected the post' }, { status: 502 });
      }
      return Response.json({ success: true, created, failures });
    }

    if (action === 'deletePost') {
      if (!params.postId) return Response.json({ error: 'postId is required' }, { status: 400 });
      await ocoya(`/post/${encodeURIComponent(params.postId)}`, { method: 'DELETE' });
      return Response.json({ success: true });
    }

    if (action === 'connectUrl') {
      if (!params.provider) return Response.json({ error: 'provider is required' }, { status: 400 });
      const result = await ocoya(`/social-profiles/connection-url?workspaceId=${ws}`, {
        method: 'POST',
        body: { provider: params.provider },
      });
      return Response.json(result);
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});