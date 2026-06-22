import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Creates a Square-hosted checkout (Payment Link) and returns its URL.
// The browser redirects the buyer to Square's hosted page; payment completion
// is recorded asynchronously by the squarePaymentWebhook function.
// Amounts are ALWAYS resolved server-side — never trusted from the client.
const PLAN_PRICING = {
  free: { amountCents: 1299, name: 'Solo', blueprintLimit: 1 },
  pro: { amountCents: 2500, name: 'Pro', blueprintLimit: 25 },
  agency: { amountCents: 14900, name: 'Agency', blueprintLimit: 60 },
};

// One-time service pricing — amounts resolved server-side only
const SERVICE_PRICING = {
  // ER Service
  er_audit: { amountCents: 5000, name: 'App Audit — Report + Fix Prompts' },
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
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { planId, productId, serviceId, donationCents, promptSessionId, redirectUrl } = await req.json();

    // Pro members get 40% off products and one-time services (not subscriptions,
    // donations, or prompt packs). Plan is resolved server-side from the profile.
    let isProMember = false;
    try {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ userId: user.id });
      isProMember = profiles[0]?.plan === 'pro';
    } catch (_e) { isProMember = false; }
    const applyProDiscount = (cents) => isProMember ? Math.round(cents * 0.6) : cents;

    let amountCents, itemName, productIdResolved = null, isDonation = false, promptSessionResolved = null;
    if (serviceId) {
      const service = SERVICE_PRICING[serviceId];
      if (!service) return Response.json({ error: 'Invalid service.' }, { status: 400 });
      amountCents = applyProDiscount(service.amountCents);
      itemName = isProMember ? `${service.name} (Pro 40% off)` : service.name;
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
    } else if (planId) {
      const plan = PLAN_PRICING[planId];
      if (!plan) return Response.json({ error: 'Invalid plan.' }, { status: 400 });
      amountCents = plan.amountCents;
      itemName = `ForgeBase ${plan.name} plan`;
    } else if (productId) {
      const products = await base44.asServiceRole.entities.Product.filter({ id: productId });
      const product = products[0];
      if (!product || product.active === false) return Response.json({ error: 'Product not found.' }, { status: 404 });
      amountCents = applyProDiscount(product.priceCents);
      itemName = isProMember ? `${product.name} (Pro 40% off)` : product.name;
      productIdResolved = product.id;
    } else {
      return Response.json({ error: 'Invalid payment request.' }, { status: 400 });
    }

    const env = Deno.env.get('SQUARE_ENVIRONMENT') === 'production' ? 'production' : 'sandbox';
    const baseUrl = env === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';

    // metadata is echoed back on the webhook order so we can attribute the payment.
    // Square rejects empty-string metadata values, so only include set keys.
    const metadata = {
      base44UserId: user.id,
      base44UserEmail: user.email,
      itemName,
    };
    if (serviceId) metadata.serviceId = serviceId;
    if (planId) metadata.planId = planId;
    if (productIdResolved) metadata.productId = productIdResolved;
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
          buyer_email: user.email,
        },
        payment_note: `${itemName} — ${user.email}`,
        order: {
          location_id: Deno.env.get('SQUARE_LOCATION_ID'),
          metadata,
          line_items: [
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