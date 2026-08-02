import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { verifyLicenseKey } from '../../shared/desktopLicense.ts';

// Public key-status endpoint for the Base44 Desktop IDE.
// The user pastes their account key into the app; the app sends it here and
// gets back whether the key is active, and whether it's lifetime or monthly.
//   POST { licenseKey, appVersion? }
//   GET  ?key=KB-XXXX-XXXX-XXXX-XXXX&appVersion=1.0.0
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    let licenseKey = url.searchParams.get('key') || url.searchParams.get('licenseKey') || '';
    let appVersion = url.searchParams.get('appVersion') || '';

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      licenseKey = body.licenseKey || body.key || licenseKey;
      appVersion = body.appVersion || appVersion;
    }

    const result = await verifyLicenseKey(base44, licenseKey, appVersion);
    return Response.json(result.body, { status: result.status, headers: CORS });
  } catch (error) {
    return Response.json({ valid: false, reason: 'error', error: error.message }, { status: 500, headers: CORS });
  }
});