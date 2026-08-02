import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { ensureLicense, verifyLicenseKey } from '../../shared/desktopLicense.ts';

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
      const result = await verifyLicenseKey(base44, body.licenseKey, body.appVersion);
      return json(result.body, result.status);
    }

    return json({ error: 'Unknown action. Use "get" or "verify".' }, 400);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
});