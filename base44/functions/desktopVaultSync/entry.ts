import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { hasDesktopProAccess } from '../../shared/desktopProAccess.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (data, status = 200) => Response.json(data, { status, headers: CORS });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (_e) {
      user = null;
    }
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const pro = await hasDesktopProAccess(base44, user);
    if (!pro.hasAccess) {
      return json({ error: 'Desktop Pro membership required.', code: 'PRO_REQUIRED' }, 403);
    }

    const body = await req.json().catch(() => ({}));
    // Optional incremental sync: only return records updated after this ISO timestamp.
    const query = { published: true };
    if (body.updatedSince) query.updated_date = { $gte: body.updatedSince };

    const prompts = await base44.asServiceRole.entities.VaultPrompt.filter(query, '-updated_date', 1000);
    const skills = await base44.asServiceRole.entities.AgentSkill.filter(query, '-updated_date', 1000);

    return json({
      syncedAt: new Date().toISOString(),
      via: pro.via,
      prompts,
      skills,
    });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
});