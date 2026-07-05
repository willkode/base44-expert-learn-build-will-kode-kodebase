import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Validates a coupon code against the cart contents and returns the override
// prices. Read-only — redemption is recorded by squarePaymentWebhook after a
// completed payment. Coupon entity is admin-only, so lookup uses service role;
// knowing the code is what grants the discount, so no user auth is required
// (the cart is usable before login).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { code, productIds } = await req.json();

    const clean = String(code || '').trim().toUpperCase();
    if (!clean) return Response.json({ valid: false, error: 'Enter a coupon code.' });

    const coupons = await base44.asServiceRole.entities.Coupon.filter({ code: clean });
    const coupon = coupons[0];
    if (!coupon || coupon.active === false) {
      return Response.json({ valid: false, error: 'This coupon code is not valid.' });
    }
    if (coupon.singleUse !== false && (coupon.usedCount || 0) > 0) {
      return Response.json({ valid: false, error: 'This coupon has already been used.' });
    }

    const ids = Array.isArray(productIds) ? productIds.map(String) : [];
    const prices = {};
    for (const o of coupon.productPrices || []) {
      if (!o?.productId || !Number.isFinite(o.priceCents)) continue;
      if (ids.length === 0 || ids.includes(o.productId)) {
        prices[o.productId] = Math.max(0, Math.round(o.priceCents));
      }
    }
    if (Object.keys(prices).length === 0) {
      return Response.json({ valid: false, error: "This coupon doesn't apply to any items in your cart." });
    }

    return Response.json({ valid: true, code: coupon.code, prices });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});