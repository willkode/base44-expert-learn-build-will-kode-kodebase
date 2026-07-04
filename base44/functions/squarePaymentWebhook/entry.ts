import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Square webhook (payment.created / payment.updated). Records a completed
// Payment record and upgrades the user's plan. This is the source of truth for
// Square-hosted checkout — payments happen off-site, so we reconcile here.
// Called without user auth — request authenticity is verified via the
// Square webhook signature (HMAC-SHA256 over notificationUrl + raw body).

async function isValidSignature(signatureKey, notificationUrl, rawBody, signatureHeader) {
  if (!signatureKey || !signatureHeader) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(signatureKey),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBytes = await crypto.subtle.sign('HMAC', key, enc.encode(notificationUrl + rawBody));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));
  return expected === signatureHeader;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const rawBody = await req.text();

    const signatureKey = Deno.env.get('SQUARE_WEBHOOK_SIGNATURE_KEY');
    const signatureHeader = req.headers.get('x-square-hmacsha256-signature');
    const notificationUrl = req.url;
    const valid = await isValidSignature(signatureKey, notificationUrl, rawBody, signatureHeader);
    if (!valid) return Response.json({ error: 'Invalid signature' }, { status: 401 });

    const event = JSON.parse(rawBody);
    const payment = event?.data?.object?.payment;
    if (!payment || payment.status !== 'COMPLETED') {
      return Response.json({ received: true });
    }

    // Idempotency — skip if we already recorded this Square payment.
    const existing = await base44.asServiceRole.entities.Payment.filter({ squarePaymentId: payment.id });
    if (existing.length > 0) return Response.json({ received: true, duplicate: true });

    const env = Deno.env.get('SQUARE_ENVIRONMENT') === 'production' ? 'production' : 'sandbox';
    const baseUrl = env === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';

    // Fetch the order to read the metadata we attached at checkout-link creation.
    let metadata = {};
    let lineItemName = '';
    if (payment.order_id) {
      const orderRes = await fetch(`${baseUrl}/v2/orders/${payment.order_id}`, {
        headers: {
          Authorization: `Bearer ${Deno.env.get('SQUARE_ACCESS_TOKEN')}`,
          'Square-Version': '2025-01-23',
        },
      });
      const orderBody = await orderRes.json();
      metadata = orderBody?.order?.metadata || {};
      lineItemName = orderBody?.order?.line_items?.[0]?.name || '';
    }

    let userId = metadata.base44UserId || null;
    let userEmail = metadata.base44UserEmail || payment.buyer_email_address || '';
    const planId = metadata.planId || null;
    let productId = metadata.productId || null;
    const promptSessionId = metadata.promptSessionId || null;
    const itemName = metadata.itemName || lineItemName || 'Purchase';
    const amountCents = payment.amount_money?.amount || 0;

    // Fallback attribution — Square doesn't always echo order metadata back on
    // payment-link orders. Match the buyer by email (we pre-populate it at
    // checkout) so real purchases are never silently dropped.
    if (!userId && userEmail) {
      const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
      if (users[0]) userId = users[0].id;
    }

    // Fallback product resolution — match the line-item name (minus promo
    // suffixes) against the product catalog so buyers get assigned the product.
    if (!productId && !planId && !promptSessionId && !metadata.serviceId && !metadata.donation) {
      const cleanName = (metadata.itemName || lineItemName || '')
        .replace(/\s*\((Summer Special 50% off|Pro 40% off)\)\s*$/, '')
        .trim();
      if (cleanName) {
        const products = await base44.asServiceRole.entities.Product.list('-created_date', 500);
        const match = products.find((p) => p.name === cleanName);
        if (match) productId = match.id;
      }
    }

    if (!userId) {
      // Could not match a user — record it anyway for admin review instead of
      // dropping the payment, then acknowledge so Square stops retrying.
      await base44.asServiceRole.entities.Payment.create({
        userId: 'external_square',
        userEmail: userEmail || 'unknown',
        productId: productId || undefined,
        itemName,
        amountCents,
        currency: 'USD',
        squarePaymentId: payment.id,
        squareReceiptUrl: payment.receipt_url || '',
        status: 'completed',
        errorMessage: 'Unattributed — no matching app user; review in Admin > Sales',
      });
      return Response.json({ received: true, unattributed: true });
    }

    await base44.asServiceRole.entities.Payment.create({
      userId,
      userEmail: userEmail || '',
      planId: planId || undefined,
      productId: productId || undefined,
      promptSessionId: promptSessionId || undefined,
      itemName,
      amountCents,
      currency: 'USD',
      squarePaymentId: payment.id,
      squareReceiptUrl: payment.receipt_url || '',
      status: 'completed',
    });

    // Fire the PDF receipt email — never let a delivery failure break payment
    // reconciliation (Square will retry the whole webhook otherwise).
    if (userEmail) {
      try {
        await base44.asServiceRole.functions.invoke('sendPurchaseReceipt', {
          email: userEmail,
          itemName,
          amountCents,
          paymentId: payment.id,
          purchaseDate: new Date().toISOString(),
        });
      } catch (_e) {
        // ignore — receipt is best-effort
      }
    }

    // Complete Builder Bundle — expand into individual product access so every
    // included product shows up in My Products with its own download.
    if (productId) {
      const prods = await base44.asServiceRole.entities.Product.filter({ id: productId });
      if (prods[0]?.slug === 'complete-builder-bundle') {
        const all = await base44.asServiceRole.entities.Product.filter({ active: true });
        const included = all.filter((p) => p.slug !== 'complete-builder-bundle' && (p.priceCents || 0) > 0);
        for (const p of included) {
          await base44.asServiceRole.entities.Payment.create({
            userId,
            userEmail: userEmail || '',
            productId: p.id,
            itemName: `${p.name} (Complete Builder Bundle)`,
            amountCents: 0,
            currency: 'USD',
            squarePaymentId: `${payment.id}-bundle-${p.id}`,
            status: 'completed',
          });
        }
      }
    }

    // Prompt Engine: unlock the prompt pack for this session.
    if (promptSessionId) {
      const sessions = await base44.asServiceRole.entities.PromptGeneratorSession.filter({ id: promptSessionId });
      if (sessions[0]) {
        await base44.asServiceRole.entities.PromptGeneratorSession.update(promptSessionId, {
          unlocked: true,
          unlocked_at: new Date().toISOString(),
        });
      }
    }

    // Plan purchases upgrade the user's profile.
    const PLAN_LIMITS = { free: 1, pro: 25, agency: 60, pro_annual: 25 };
    if (planId && PLAN_LIMITS[planId] !== undefined) {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ userId });
      const planData = {
        plan: planId === 'pro_annual' ? 'pro' : planId,
        blueprintLimit: PLAN_LIMITS[planId],
        usagePeriodStart: new Date().toISOString(),
      };
      if (profiles.length > 0) {
        await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, planData);
      } else {
        await base44.asServiceRole.entities.UserProfile.create({
          userId, email: metadata.base44UserEmail || '', ...planData,
        });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});