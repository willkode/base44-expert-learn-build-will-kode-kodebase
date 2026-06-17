import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ---------------------------------------------------------------------------
// Centralized, redaction-safe audit logger for the Social Marketing system.
//
// SECURITY GUARANTEES:
// - Never persists raw access tokens, refresh tokens, Facebook Page tokens,
//   client secrets, signatures or authorization headers.
// - Recursively redacts sensitive keys from metadata + platform responses.
// - Redacts Meta/OAuth token response shapes.
//
// This is a reusable utility. Other backend functions may call it via
// base44.functions.invoke('logSocialEvent', { ... }) but existing inline
// SocialAutomationLog writes continue to work unchanged.
// ---------------------------------------------------------------------------

// Keys whose values must never be stored, matched case-insensitively as a substring.
const SENSITIVE_KEY_PATTERNS = [
  'access_token', 'accesstoken', 'refresh_token', 'refreshtoken',
  'page_access_token', 'pageaccesstoken', 'page_token',
  'id_token', 'idtoken', 'bearer', 'authorization', 'auth_header',
  'client_secret', 'clientsecret', 'app_secret', 'appsecret',
  'secret', 'signature', 'signed_request', 'api_key', 'apikey',
  'password', 'private_key', 'privatekey', 'code_verifier', 'oauth_token',
  'token_secret', 'session_token', 'long_lived_token', 'short_lived_token',
];

const REDACTED = '[REDACTED]';
const MAX_DEPTH = 6;
const MAX_STRING = 2000;

function isSensitiveKey(key) {
  const k = String(key).toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((p) => k.includes(p));
}

// Catch token-shaped strings even when the key isn't obviously sensitive.
function looksLikeToken(value) {
  if (typeof value !== 'string') return false;
  if (value.length < 40) return false;
  // JWTs (xxx.yyy.zzz) and long opaque tokens with no spaces.
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) return true;
  if (/^(EAA|EAAB|ya29\.|Bearer\s)/.test(value)) return true; // Meta + Google access tokens
  return false;
}

function redact(value, depth = 0) {
  if (value == null) return value;
  if (depth > MAX_DEPTH) return '[TRUNCATED]';

  if (typeof value === 'string') {
    if (looksLikeToken(value)) return REDACTED;
    return value.length > MAX_STRING ? value.slice(0, MAX_STRING) + '…[truncated]' : value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (Array.isArray(value)) {
    return value.slice(0, 100).map((v) => redact(v, depth + 1));
  }
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (isSensitiveKey(k)) { out[k] = REDACTED; continue; }
      out[k] = redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

// Public helper so callers can sanitize before passing data around.
export function redactMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return {};
  return redact(metadata, 0);
}

const VALID_STATUSES = new Set(['success', 'warning', 'error']);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Accept an authenticated admin (UI/manual) OR an internal scheduler call
    // bearing the shared internal secret.
    let userId = null;
    let isAdmin = false;
    try {
      const u = await base44.auth.me();
      if (u?.role === 'admin') { isAdmin = true; userId = u.id; }
    } catch (_e) { /* unauthenticated scheduler call */ }

    const body = await req.json().catch(() => ({}));
    const internalSecret = req.headers.get('x-internal-secret');
    const isInternal = internalSecret && internalSecret === Deno.env.get('INTERNAL_FUNCTION_SECRET');

    if (!isAdmin && !isInternal) {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const {
      account_id = 'global',
      user_id = null,
      event_type,
      platform = null,
      related_campaign_id = null,
      related_post_id = null,
      related_scheduled_post_id = null,
      status = 'success',
      message = '',
      metadata = {},
    } = body || {};

    if (!event_type) {
      return Response.json({ success: false, error: 'event_type is required.' }, { status: 400 });
    }

    const safeStatus = VALID_STATUSES.has(status) ? status : 'success';
    const safeMetadata = redactMetadata(metadata);

    const log = await base44.asServiceRole.entities.SocialAutomationLog.create({
      account_id,
      user_id: user_id || userId || undefined,
      event_type,
      platform: platform || undefined,
      related_campaign_id: related_campaign_id || undefined,
      related_post_id: related_post_id || undefined,
      related_scheduled_post_id: related_scheduled_post_id || undefined,
      status: safeStatus,
      message: typeof message === 'string' ? message.slice(0, MAX_STRING) : '',
      metadata: safeMetadata,
    });

    return Response.json({ success: true, log });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});