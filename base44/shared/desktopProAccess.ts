// Single source of truth for Desktop Pro membership ($25/mo or $240 lifetime).
// Used by desktopAuth and desktopVaultSync.
export const DESKTOP_PRO_PRODUCT_SLUG = 'desktop-pro-access';
export const DESKTOP_PRO_MONTHLY_PLAN_ID = 'desktop-pro-monthly';

export async function hasDesktopProAccess(base44, user) {
  if (!user) return { hasAccess: false, via: null };
  if (user.role === 'admin') return { hasAccess: true, via: 'admin' };

  // Lifetime: completed one-time purchase of the Desktop Pro product.
  const products = await base44.asServiceRole.entities.Product.filter(
    { slug: DESKTOP_PRO_PRODUCT_SLUG }, '-created_date', 1
  );
  const productId = products[0]?.id;
  if (productId) {
    const lifetime = await base44.asServiceRole.entities.Payment.filter(
      { userId: user.id, productId, status: 'completed' }, '-created_date', 1
    );
    if (lifetime.length > 0) return { hasAccess: true, via: 'lifetime' };
  }

  // Monthly: completed subscription payment recorded against the monthly plan.
  const monthly = await base44.asServiceRole.entities.Payment.filter(
    { userId: user.id, planId: DESKTOP_PRO_MONTHLY_PLAN_ID, status: 'completed' }, '-created_date', 1
  );
  if (monthly.length > 0) return { hasAccess: true, via: 'monthly' };

  return { hasAccess: false, via: null };
}