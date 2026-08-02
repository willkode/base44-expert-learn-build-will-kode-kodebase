// Desktop IDE account keys: issuing, syncing and validating the key the
// desktop app checks on launch. Entitlement truth still comes from Payments.
import { DESKTOP_PRO_PRODUCT_SLUG, DESKTOP_PRO_MONTHLY_PLAN_ID } from './desktopProAccess.ts';

const MONTHLY_GRACE_DAYS = 31;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateLicenseKey() {
  const block = () =>
    Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map((n) => ALPHABET[n % ALPHABET.length])
      .join('');
  return `KB-${block()}-${block()}-${block()}-${block()}`;
}

// Resolves the current entitlement for a user: lifetime purchase, active
// monthly subscription (last completed payment within the billing window), or none.
export async function resolveEntitlement(base44, user) {
  if (!user) return { plan: 'none', status: 'inactive', expiresAt: '' };
  if (user.role === 'admin') return { plan: 'admin', status: 'active', expiresAt: '' };

  const products = await base44.asServiceRole.entities.Product.filter(
    { slug: DESKTOP_PRO_PRODUCT_SLUG }, '-created_date', 1
  );
  const productId = products[0]?.id;
  if (productId) {
    const lifetime = await base44.asServiceRole.entities.Payment.filter(
      { userId: user.id, productId, status: 'completed' }, '-created_date', 1
    );
    if (lifetime.length > 0) return { plan: 'lifetime', status: 'active', expiresAt: '' };
  }

  const monthly = await base44.asServiceRole.entities.Payment.filter(
    { userId: user.id, planId: DESKTOP_PRO_MONTHLY_PLAN_ID, status: 'completed' }, '-created_date', 1
  );
  if (monthly.length > 0) {
    const paidAt = new Date(monthly[0].created_date);
    const expires = new Date(paidAt.getTime() + MONTHLY_GRACE_DAYS * 86400000);
    return {
      plan: 'monthly',
      status: expires > new Date() ? 'active' : 'expired',
      expiresAt: expires.toISOString(),
    };
  }

  return { plan: 'none', status: 'inactive', expiresAt: '' };
}

// Validates a pasted key and refreshes its stored state. Shared by the
// desktopLicense function and the public desktopLicenseStatus endpoint.
export async function verifyLicenseKey(base44, rawKey, appVersion) {
  const key = String(rawKey || '').trim().toUpperCase();
  if (!key) return { status: 400, body: { valid: false, reason: 'missing_key' } };

  const found = await base44.asServiceRole.entities.DesktopLicense.filter(
    { licenseKey: key }, '-created_date', 1
  );
  const license = found[0];
  if (!license) return { status: 404, body: { valid: false, reason: 'not_found' } };
  if (license.revoked) return { status: 403, body: { valid: false, reason: 'revoked', plan: license.plan } };

  const users = await base44.asServiceRole.entities.User.filter({ id: license.userId }, '-created_date', 1);
  const entitlement = await resolveEntitlement(base44, users[0]);

  await base44.asServiceRole.entities.DesktopLicense.update(license.id, {
    plan: entitlement.plan,
    status: entitlement.status,
    expiresAt: entitlement.expiresAt,
    lastCheckedAt: new Date().toISOString(),
    lastCheckedVersion: appVersion ? String(appVersion).slice(0, 32) : license.lastCheckedVersion,
    checkCount: (license.checkCount || 0) + 1,
  });

  return {
    status: 200,
    body: {
      valid: entitlement.status === 'active',
      reason: entitlement.status === 'active' ? null : entitlement.status,
      plan: entitlement.plan,
      status: entitlement.status,
      expiresAt: entitlement.expiresAt || null,
      email: license.userEmail || users[0]?.email || null,
    },
  };
}

// Returns the user's key (creating one on first request) with its entitlement
// state refreshed from payment records.
export async function ensureLicense(base44, user) {
  const existing = await base44.asServiceRole.entities.DesktopLicense.filter(
    { userId: user.id }, '-created_date', 1
  );
  const entitlement = await resolveEntitlement(base44, user);
  const fields = {
    userEmail: user.email,
    plan: entitlement.plan,
    status: existing[0]?.revoked ? 'revoked' : entitlement.status,
    expiresAt: entitlement.expiresAt,
  };

  if (existing[0]) {
    return await base44.asServiceRole.entities.DesktopLicense.update(existing[0].id, fields);
  }
  return await base44.asServiceRole.entities.DesktopLicense.create({
    userId: user.id,
    licenseKey: generateLicenseKey(),
    ...fields,
  });
}