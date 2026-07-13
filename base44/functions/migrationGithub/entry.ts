import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const CONNECTOR_ID = '6a550f001ae3ab15be249828';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { action, owner, repo } = await req.json();
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const headers = { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (action === 'repositories') {
      const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member', { headers });
      if (!response.ok) throw new Error(response.status === 401 ? 'GitHub connection expired.' : 'Could not load repositories.');
      const rows = await response.json();
      return Response.json({ repositories: rows.map((r) => ({ id: String(r.id), name: r.name, full_name: r.full_name, owner: r.owner.login, private: r.private, default_branch: r.default_branch, updated_at: r.updated_at })) });
    }
    if (action === 'branches' && owner && repo) {
      const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches?per_page=100`, { headers });
      if (!response.ok) throw new Error(response.status === 404 ? 'Repository not found or no longer authorized.' : 'Could not load branches.');
      const rows = await response.json();
      return Response.json({ branches: rows.map((b) => ({ name: b.name, sha: b.commit.sha })) });
    }
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});