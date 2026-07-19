import { createClientFromRequest, createClient } from 'npm:@base44/sdk@0.8.38';
import { hasDesktopProAccess } from '../../shared/desktopProAccess.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (data, status = 200) => Response.json(data, { status, headers: CORS });

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  role: user.role,
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'login';

    if (action === 'login') {
      const { email, password } = body;
      if (!email || !password) return json({ error: 'Email and password are required.' }, 400);

      const appId = Deno.env.get('BASE44_APP_ID');
      const client = createClient({ appId });
      let result;
      try {
        result = await client.auth.loginViaEmailPassword(email, password);
      } catch (_e) {
        return json({ error: 'Invalid email or password.' }, 401);
      }
      const accessToken = result?.access_token || result?.accessToken || result?.token || result?.data?.access_token || null;
      if (!accessToken) return json({ error: 'Login failed. Please verify your account and try again.' }, 401);

      client.auth.setToken(accessToken);
      const user = await client.auth.me();

      // Service-role client for entitlement lookup.
      const base44 = createClientFromRequest(req);
      const pro = await hasDesktopProAccess(base44, user);

      return json({ access_token: accessToken, user: publicUser(user), pro });
    }

    if (action === 'me') {
      const base44 = createClientFromRequest(req);
      let user = null;
      try {
        user = await base44.auth.me();
      } catch (_e) {
        user = null;
      }
      if (!user) return json({ error: 'Unauthorized' }, 401);
      const pro = await hasDesktopProAccess(base44, user);
      return json({ user: publicUser(user), pro });
    }

    return json({ error: 'Unknown action. Use "login" or "me".' }, 400);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
});