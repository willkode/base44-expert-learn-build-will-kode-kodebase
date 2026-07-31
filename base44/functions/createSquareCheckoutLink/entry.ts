import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Creates a Square-hosted checkout (Payment Link) and returns its URL.
// The browser redirects the buyer to Square's hosted page; payment completion
// is recorded asynchronously by the squarePaymentWebhook function.
// Amounts are ALWAYS resolved server-side — never trusted from the client.
// One-time service pricing — amounts resolved server-side only
const SERVICE_PRICING = {
  // ER Service
  er_audit: { amountCents: 2000, name: 'App Audit — Report + Fix Prompts (Special $20)' },
  er_audit_fix: { amountCents: 6250, name: 'App Audit + Fix (50% off)' },
  // Security Audit
  security_audit: { amountCents: 5000, name: 'Security Audit — Report + Fix Prompts' },
  security_audit_fix: { amountCents: 6250, name: 'Security Audit + Fix (50% off)' },
  // SEO Audit
  seo_audit: { amountCents: 5000, name: 'SEO Audit — Report + Fix Prompts' },
  seo_audit_fix: { amountCents: 12500, name: 'SEO Audit + Fix' },
  seo_ssr_setup: { amountCents: 15000, name: 'SSR / Prerender Setup' },
  // Kode Sessions
  kode_session_1hr: { amountCents: 7500, name: 'Kode Session — 1 Hour' },
  kode_session_2hr: { amountCents: 15000, name: 'Kode Session — 2 Hours' },
  // KodeCare — Ongoing monthly support retainers
  kodecare_starter: { amountCents: 12000, name: 'KodeCare Starter — Monthly Support Retainer' },
  kodecare_growth: { amountCents: 25000, name: 'KodeCare Growth — Monthly Support Retainer' },
  kodecare_pro: { amountCents: 50000, name: 'KodeCare Pro — Monthly Support Retainer' },
  // Base44 Master Class — live cohort seat, Aug 10 2026, 100 seats
  masterclass_seat: { amountCents: 9900, name: 'Base44 Master Class — Seat (Aug 10, 2026)' },
};

// Kode Sessions included in the 50% off promo
const KODE_SESSION_SALE_IDS = ['kode_session_1hr', 'kode_session_2hr'];

// Products never discounted by the sale (fixed-price services sold as products).
const SALE_EXCLUDED_SLUGS = ['hire-will-kode', 'desktop-pro-access'];

// Will's Birthday Sale: 86% off all products through Oct 19, 11:59 AM Central
// (16:59 UTC), anchored to the current calendar year.
const isBirthdaySaleActive = () => {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), 9, 19, 16, 59, 0, 0));
  return now < end;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    const { productId, productIds, serviceId, donationCents, promptSessionId, redirectUrl, couponCode, guestName, guestEmail, appUrl } = await req.json();

    // Services can be ordered as a guest (no account needed) — everything else
    // still requires an authenticated user.
    // Tips/donations are also open to guests — no account needed to support the free content.
    if (!user && !serviceId && donationCents == null) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user && serviceId) {
      const emailOk = typeof guestEmail === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim());
      if (!guestName?.trim() || !emailOk) {
        return Response.json({ error: 'Please provide your name and a valid email.' }, { status: 400 });
      }
    }

    let amountCents, itemName, productIdResolved = null, isDonation = false, promptSessionResolved = null, cartItems = null, metadataCouponCode = null;
    if (Array.isArray(productIds) && productIds.length > 0) {
      // Cart checkout — multiple products in one Square order, one line item each.
      // Prices are always resolved server-side from the catalog.
      const uniqueIds = [...new Set(productIds.map(String))];
      if (uniqueIds.length > 10) {
        return Response.json({ error: 'Carts are limited to 10 products.' }, { status: 400 });
      }
      // Coupon — re-validated server-side; the code is never trusted from the client.
      let coupon = null;
      if (couponCode) {
        const found = await base44.asServiceRole.entities.Coupon.filter({ code: String(couponCode).trim().toUpperCase() });
        const c = found[0];
        const exhausted = c && c.singleUse !== false && (c.usedCount || 0) > 0;
        if (!c || c.active === false || exhausted) {
          return Response.json({ error: 'This coupon is no longer valid. Remove it and try again.' }, { status: 400 });
        }
        coupon = c;
      }
      const all = await base44.asServiceRole.entities.Product.filter({ active: true });
      const resolved = [];
      for (const id of uniqueIds) {
        const product = all.find((p) => p.id === id);
        if (!product) return Response.json({ error: 'One of the products in your cart is no longer available.' }, { status: 404 });
        if ((product.priceCents || 0) === 0) continue; // free products are claimed directly, not purchased
        let cents, name;
        const override = coupon?.productPrices?.find((o) => o.productId === product.id);
        if (override && Number.isFinite(override.priceCents)) {
          cents = Math.max(0, Math.round(override.priceCents));
          name = `${product.name} (Coupon ${coupon.code})`;
        } else if (isBirthdaySaleActive() && !SALE_EXCLUDED_SLUGS.includes(product.slug)) {
          cents = Math.round(product.priceCents * 0.14);
          name = `${product.name} (Will's Birthday Sale 86% off)`;
        } else {
          cents = product.priceCents;
          name = product.name;
        }
        resolved.push({ id: product.id, name, cents });
      }
      if (resolved.length === 0) {
        return Response.json({ error: 'Your cart has no paid products to check out.' }, { status: 400 });
      }
      cartItems = resolved;
      amountCents = resolved.reduce((sum, i) => sum + i.cents, 0);
      if (amountCents <= 0) {
        return Response.json({ error: 'Order total must be greater than $0. Adjust the coupon or cart.' }, { status: 400 });
      }
      itemName = `Cart — ${resolved.length} product${resolved.length > 1 ? 's' : ''}`;
      if (coupon) metadataCouponCode = coupon.code;
    } else if (serviceId === 'base44_migration') {
      // Base44 Migration — $500 special through 08/07/2026 noon CT, then $2,000.
      const specialActive = new Date() < new Date('2026-08-07T17:00:00Z');
      amountCents = specialActive ? 50000 : 200000;
      itemName = specialActive
        ? 'Base44 App Migration — $500 Special (reg. $2,000)'
        : 'Base44 App Migration';
    } else if (serviceId) {
      const service = SERVICE_PRICING[serviceId];
      if (!service) return Response.json({ error: 'Invalid service.' }, { status: 400 });
      // These services are already half-price promos — the Pro discount must not stack on top.
      amountCents = service.amountCents;
      itemName = service.name;
      // Kode Sessions 50% off through 08/07/2026 11 PM Central (04:00 UTC on 08/08).
      if (KODE_SESSION_SALE_IDS.includes(serviceId) && new Date() < new Date('2026-08-08T04:00:00Z')) {
        amountCents = Math.round(service.amountCents * 0.5);
        itemName = `${service.name} (50% off)`;
      }
    } else if (promptSessionId) {
      // Prompt Engine prompt pack — fixed $10 unlock. Verify the session belongs
      // to this user and has prompts generated before charging.
      const sessions = await base44.entities.PromptGeneratorSession.filter({ id: promptSessionId });
      const session = sessions[0];
      if (!session) return Response.json({ error: 'Prompt session not found.' }, { status: 404 });
      if (session.current_stage !== 'prompts_ready') {
        return Response.json({ error: 'Prompt pack is not ready to unlock yet.' }, { status: 400 });
      }
      amountCents = 1000;
      itemName = `Prompt Pack — ${session.app_name || 'Your App'}`;
      promptSessionResolved = session.id;
    } else if (donationCents != null) {
      // Donations: amount is chosen by the supporter but bounded server-side.
      const cents = Math.round(Number(donationCents));
      if (!Number.isFinite(cents) || cents < 100 || cents > 50000) {
        return Response.json({ error: 'Donation must be between $1 and $500.' }, { status: 400 });
      }
      amountCents = cents;
      itemName = 'Buy Me a Coffee — Support';
      isDonation = true;
    } else if (productId) {
      const products = await base44.asServiceRole.entities.Product.filter({ id: productId });
      const product = products[0];
      if (!product || product.active === false) return Response.json({ error: 'Product not found.' }, { status: 404 });
      if ((product.priceCents || 0) === 0) {
        return Response.json({ error: 'This product is free — claim it directly, no payment needed.' }, { status: 400 });
      }
      if (isBirthdaySaleActive() && !SALE_EXCLUDED_SLUGS.includes(product.slug)) {
        amountCents = Math.round(product.priceCents * 0.14);
        itemName = `${product.name} (Will's Birthday Sale 86% off)`;
      } else {
        amountCents = product.priceCents;
        itemName = product.name;
      }
      productIdResolved = product.id;
    } else {
      return Response.json({ error: 'Invalid payment request.' }, { status: 400 });
    }

    const env = Deno.env.get('SQUARE_ENVIRONMENT') === 'production' ? 'production' : 'sandbox';
    const baseUrl = env === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';

    // metadata is echoed back on the webhook order so we can attribute the payment.
    // Square rejects empty-string metadata values, so only include set keys.
    const buyerEmail = user?.email || guestEmail?.trim();
    const metadata = {
      base44UserEmail: buyerEmail,
      itemName,
    };
    if (user) {
      metadata.base44UserId = user.id;
    } else {
      metadata.guestCheckout = 'true';
      metadata.guestName = guestName?.trim() || 'Anonymous';
    }
    if (appUrl?.trim()) metadata.appUrl = appUrl.trim();
    if (serviceId) metadata.serviceId = serviceId;
    if (productIdResolved) metadata.productId = productIdResolved;
    if (cartItems) metadata.cartProductIds = cartItems.map((i) => i.id).join(',');
    if (metadataCouponCode) metadata.couponCode = metadataCouponCode;
    if (promptSessionResolved) metadata.promptSessionId = promptSessionResolved;
    if (isDonation) metadata.donation = 'true';

    const res = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('SQUARE_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
        'Square-Version': '2025-01-23',
      },
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        checkout_options: {
          redirect_url: redirectUrl || undefined,
          ask_for_shipping_address: false,
        },
        pre_populated_data: {
          buyer_email: buyerEmail,
        },
        payment_note: `${itemName} — ${buyerEmail}`,
        order: {
          location_id: Deno.env.get('SQUARE_LOCATION_ID'),
          metadata,
          line_items: cartItems
            ? cartItems.map((i) => ({
                name: i.name,
                quantity: '1',
                base_price_money: { amount: i.cents, currency: 'USD' },
              }))
            : [
                {
                  name: itemName,
                  quantity: '1',
                  base_price_money: { amount: amountCents, currency: 'USD' },
                },
              ],
        },
      }),
    });
    const body = await res.json();

    if (!res.ok || !body.payment_link?.url) {
      const detail = body.errors?.[0]?.detail || 'Could not start checkout.';
      return Response.json({ error: detail }, { status: 502 });
    }

    return Response.json({
      success: true,
      checkoutUrl: body.payment_link.url,
      paymentLinkId: body.payment_link.id,
      orderId: body.payment_link.order_id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});