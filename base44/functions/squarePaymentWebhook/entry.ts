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
    if (payment.order_id) {
      const orderRes = await fetch(`${baseUrl}/v2/orders/${payment.order_id}`, {
        headers: {
          Authorization: `Bearer ${Deno.env.get('SQUARE_ACCESS_TOKEN')}`,
          'Square-Version': '2025-01-23',
        },
      });
      const orderBody = await orderRes.json();
      metadata = orderBody?.order?.metadata || {};
    }

    const userId = metadata.base44UserId;
    const planId = metadata.planId || null;
    const productId = metadata.productId || null;
    const promptSessionId = metadata.promptSessionId || null;
    const itemName = metadata.itemName || 'Purchase';
    const amountCents = payment.amount_money?.amount || 0;

    if (!userId) {
      // Nothing to attribute to — acknowledge so Square stops retrying.
      return Response.json({ received: true, unattributed: true });
    }

    await base44.asServiceRole.entities.Payment.create({
      userId,
      userEmail: metadata.base44UserEmail || '',
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
    const PLAN_LIMITS = { free: 1, pro: 25, agency: 60 };
    if (planId && PLAN_LIMITS[planId] !== undefined) {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ userId });
      const planData = {
        plan: planId,
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