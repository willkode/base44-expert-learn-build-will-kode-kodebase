import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { ensureLicense, resolveEntitlement } from '../../shared/desktopLicense.ts';

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
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'get';

    // Signed-in user views (and on first call, is issued) their account key.
    if (action === 'get') {
      const user = await base44.auth.me().catch(() => null);
      if (!user) return json({ error: 'Unauthorized' }, 401);
      const license = await ensureLicense(base44, user);
      return json({
        licenseKey: license.licenseKey,
        plan: license.plan,
        status: license.status,
        expiresAt: license.expiresAt || null,
      });
    }

    // The desktop app calls this on launch with only the key — no session needed.
    if (action === 'verify') {
      const key = String(body.licenseKey || '').trim().toUpperCase();
      if (!key) return json({ valid: false, reason: 'missing_key' }, 400);

      const found = await base44.asServiceRole.entities.DesktopLicense.filter(
        { licenseKey: key }, '-created_date', 1
      );
      const license = found[0];
      if (!license) return json({ valid: false, reason: 'not_found' }, 404);
      if (license.revoked) return json({ valid: false, reason: 'revoked', plan: license.plan }, 403);

      const users = await base44.asServiceRole.entities.User.filter({ id: license.userId }, '-created_date', 1);
      const entitlement = await resolveEntitlement(base44, users[0]);

      await base44.asServiceRole.entities.DesktopLicense.update(license.id, {
        plan: entitlement.plan,
        status: entitlement.status,
        expiresAt: entitlement.expiresAt,
        lastCheckedAt: new Date().toISOString(),
        lastCheckedVersion: body.appVersion ? String(body.appVersion).slice(0, 32) : license.lastCheckedVersion,
        checkCount: (license.checkCount || 0) + 1,
      });

      return json({
        valid: entitlement.status === 'active',
        reason: entitlement.status === 'active' ? null : entitlement.status,
        plan: entitlement.plan,
        status: entitlement.status,
        expiresAt: entitlement.expiresAt || null,
        email: license.userEmail || users[0]?.email || null,
      });
    }

    return json({ error: 'Unknown action. Use "get" or "verify".' }, 400);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
});