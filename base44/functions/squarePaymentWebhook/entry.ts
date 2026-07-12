import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Square webhook (payment.created / payment.updated). Records a completed
// Payment record and upgrades the user's plan. This is the source of truth for
// Square-hosted checkout — payments happen off-site, so we reconcile here.
// Called without user auth — request authenticity is verified via the
// Square webhook signature (HMAC-SHA256 over notificationUrl + raw body).

async function hmacBase64(signatureKey, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(signatureKey),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBytes = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sigBytes)));
}

// Square signs webhooks with HMAC-SHA256 over (notificationUrl + rawBody),
// where notificationUrl is EXACTLY the URL registered on the webhook
// subscription — which may differ from req.url behind proxies. We fetch the
// registered URL from Square using the subscription ID and validate against
// every candidate URL.
async function resolveRegisteredNotificationUrl(baseUrl) {
  const subscriptionId = Deno.env.get('SQUARE_WEBHOOK_SUBSCRIPTION_ID');
  if (!subscriptionId) return null;
  try {
    const res = await fetch(`${baseUrl}/v2/webhooks/subscriptions/${subscriptionId}`, {
      headers: {
        Authorization: `Bearer ${Deno.env.get('SQUARE_ACCESS_TOKEN')}`,
        'Square-Version': '2025-01-23',
      },
    });
    const body = await res.json();
    if (!res.ok) {
      console.error('[squareWebhook] Subscription fetch FAILED', { status: res.status, errors: body?.errors });
      return null;
    }
    return body?.subscription?.notification_url || null;
  } catch (e) {
    console.error('[squareWebhook] Subscription fetch THREW', { error: e.message });
    return null;
  }
}

async function isValidSignature(signatureKey, candidateUrls, rawBody, signatureHeader) {
  if (!signatureKey || !signatureHeader) return false;
  for (const url of candidateUrls) {
    if (!url) continue;
    const expected = await hmacBase64(signatureKey, url + rawBody);
    if (expected === signatureHeader) return true;
  }
  return false;
}

// Complete Builder Bundle — expand into individual product access so every
// included product shows up in My Products with its own download.
async function expandBundleAccess(base44, product, userId, userEmail, paymentId) {
  if (product?.slug !== 'complete-builder-bundle') return;
  const all = await base44.asServiceRole.entities.Product.filter({ active: true });
  const included = all.filter((p) => p.slug !== 'complete-builder-bundle' && p.slug !== 'complete-base44-knowledge-kit' && (p.priceCents || 0) > 0);
  for (const p of included) {
    await base44.asServiceRole.entities.Payment.create({
      userId,
      userEmail: userEmail || '',
      productId: p.id,
      itemName: `${p.name} (Complete Builder Bundle)`,
      amountCents: 0,
      currency: 'USD',
      squarePaymentId: `${paymentId}-bundle-${p.id}`,
      status: 'completed',
    });
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const rawBody = await req.text();

    const signatureKey = Deno.env.get('SQUARE_WEBHOOK_SIGNATURE_KEY');
    const signatureHeader = req.headers.get('x-square-hmacsha256-signature');
    const notificationUrl = req.url;

    // Early diagnostic log — fires on EVERY request so we can confirm Square
    // is reaching the endpoint and see what headers/body arrive on test events.
    console.log('[squareWebhook] REQUEST RECEIVED', {
      method: req.method,
      url: notificationUrl,
      hasSignatureHeader: !!signatureHeader,
      signatureHeaderLength: signatureHeader?.length || 0,
      hasSignatureKey: !!signatureKey,
      bodyLength: rawBody.length,
      bodyPreview: rawBody.slice(0, 500),
      contentType: req.headers.get('content-type'),
      userAgent: req.headers.get('user-agent'),
    });

    const envName = Deno.env.get('SQUARE_ENVIRONMENT') === 'production' ? 'production' : 'sandbox';
    const squareBaseUrl = envName === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';

    // Candidate URLs for signature validation: the URL Square has registered on
    // the subscription (authoritative), plus req.url and its https variant as
    // fallbacks in case the subscription lookup fails.
    const registeredUrl = await resolveRegisteredNotificationUrl(squareBaseUrl);
    const httpsUrl = notificationUrl.replace(/^http:/, 'https:');
    const candidateUrls = [...new Set([registeredUrl, notificationUrl, httpsUrl].filter(Boolean))];

    const valid = await isValidSignature(signatureKey, candidateUrls, rawBody, signatureHeader);
    console.log('[squareWebhook] Signature validation result', { valid, registeredUrl, candidateCount: candidateUrls.length });
    if (!valid) {
      console.error('[squareWebhook] Signature validation FAILED', {
        hasSignatureKey: !!signatureKey,
        hasSignatureHeader: !!signatureHeader,
        registeredUrl,
        notificationUrl,
      });
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const payment = event?.data?.object?.payment;
    console.log('[squareWebhook] Event received', {
      eventType: event?.type,
      paymentId: payment?.id,
      paymentStatus: payment?.status,
      orderId: payment?.order_id,
    });
    if (!payment || payment.status !== 'COMPLETED') {
      console.log('[squareWebhook] Skipping — no payment or not COMPLETED');
      return Response.json({ received: true });
    }

    // Idempotency — skip if we already recorded this Square payment.
    const existing = await base44.asServiceRole.entities.Payment.filter({ squarePaymentId: payment.id });
    if (existing.length > 0) return Response.json({ received: true, duplicate: true });

    const baseUrl = squareBaseUrl;

    // Fetch the order to read the metadata we attached at checkout-link creation.
    let metadata = {};
    let lineItemName = '';
    let orderLineItems = [];
    if (payment.order_id) {
      try {
        const orderRes = await fetch(`${baseUrl}/v2/orders/${payment.order_id}`, {
          headers: {
            Authorization: `Bearer ${Deno.env.get('SQUARE_ACCESS_TOKEN')}`,
            'Square-Version': '2025-01-23',
          },
        });
        const orderBody = await orderRes.json();
        if (!orderRes.ok) {
          console.error('[squareWebhook] Square order fetch FAILED', {
            status: orderRes.status,
            orderId: payment.order_id,
            errors: orderBody?.errors,
          });
        }
        metadata = orderBody?.order?.metadata || {};
        orderLineItems = orderBody?.order?.line_items || [];
        lineItemName = orderLineItems[0]?.name || '';
        console.log('[squareWebhook] Order resolved', {
          orderId: payment.order_id,
          metadataKeys: Object.keys(metadata),
          lineItemNames: orderLineItems.map((l) => l.name),
        });
      } catch (orderError) {
        console.error('[squareWebhook] Square order fetch THREW', {
          orderId: payment.order_id,
          error: orderError.message,
        });
      }
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
        .replace(/\s*\((Summer Special \d+% off|Pro 40% off|Coupon [A-Z0-9_-]+)\)\s*$/, '')
        .trim();
      if (cleanName) {
        const products = await base44.asServiceRole.entities.Product.list('-created_date', 500);
        const match = products.find((p) => p.name === cleanName);
        if (match) productId = match.id;
      }
    }

    console.log('[squareWebhook] Attribution result', {
      userId, userEmail, planId, productId, promptSessionId, itemName, amountCents,
    });

    if (!userId) {
      console.error('[squareWebhook] UNATTRIBUTED payment — no matching user', {
        paymentId: payment.id, userEmail, itemName,
      });
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

    // Coupon redemption — mark the coupon used after a completed payment.
    // Single-use coupons deactivate so they can never be redeemed twice.
    if (metadata.couponCode) {
      const coupons = await base44.asServiceRole.entities.Coupon.filter({ code: metadata.couponCode });
      const coupon = coupons[0];
      if (coupon) {
        await base44.asServiceRole.entities.Coupon.update(coupon.id, {
          usedCount: (coupon.usedCount || 0) + 1,
          usedBy: userEmail || '',
          usedAt: new Date().toISOString(),
          ...(coupon.singleUse !== false ? { active: false } : {}),
        });
      }
    }

    // Cart checkout — multiple products in one Square order. Create one Payment
    // per product so each shows up in My Products with its own download.
    const stripPromo = (n) => (n || '').replace(/\s*\((Summer Special \d+% off|Pro 40% off|Coupon [A-Z0-9_-]+)\)\s*$/, '').trim();
    let cartIds = (metadata.cartProductIds || '').split(',').filter(Boolean);
    if (cartIds.length === 0 && orderLineItems.length > 1) {
      // Metadata wasn't echoed back — resolve each line item by product name.
      const catalog = await base44.asServiceRole.entities.Product.list('-created_date', 500);
      cartIds = orderLineItems
        .map((l) => catalog.find((p) => p.name === stripPromo(l.name))?.id)
        .filter(Boolean);
    }
    if (cartIds.length > 0) {
      let first = true;
      for (const pid of cartIds) {
        const prods = await base44.asServiceRole.entities.Product.filter({ id: pid });
        const product = prods[0];
        if (!product) continue;
        const li = orderLineItems.find((l) => stripPromo(l.name) === product.name);
        await base44.asServiceRole.entities.Payment.create({
          userId,
          userEmail: userEmail || '',
          productId: pid,
          itemName: li?.name || product.name,
          amountCents: li?.total_money?.amount ?? li?.base_price_money?.amount ?? 0,
          currency: 'USD',
          squarePaymentId: first ? payment.id : `${payment.id}-cart-${pid}`,
          squareReceiptUrl: first ? (payment.receipt_url || '') : '',
          status: 'completed',
        });
        first = false;
        await expandBundleAccess(base44, product, userId, userEmail, payment.id);
      }
      return Response.json({ received: true, cartItems: cartIds.length });
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

    // Bundle purchases expand into individual product access.
    if (productId) {
      const prods = await base44.asServiceRole.entities.Product.filter({ id: productId });
      if (prods[0]) await expandBundleAccess(base44, prods[0], userId, userEmail, payment.id);
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

    console.log('[squareWebhook] SUCCESS — payment recorded', { paymentId: payment.id, userId, productId });
    return Response.json({ received: true });
  } catch (error) {
    console.error('[squareWebhook] Handler THREW', { error: error.message, stack: error.stack });
    return Response.json({ error: error.message }, { status: 500 });
  }
});