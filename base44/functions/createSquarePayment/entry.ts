import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Server-side source of truth for plan prices — never trust amounts from the client.
const PLAN_PRICING = {
  free: { amountCents: 1299, name: 'Solo', blueprintLimit: 1 },
  pro: { amountCents: 3900, name: 'Pro', blueprintLimit: 25 },
  agency: { amountCents: 14900, name: 'Agency', blueprintLimit: 60 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sourceId, planId, productId } = await req.json();
    if (!sourceId) return Response.json({ error: 'Invalid payment request.' }, { status: 400 });

    // Resolve what is being purchased — amounts always come from the server.
    let amountCents, itemName, plan = null, product = null;
    if (planId) {
      plan = PLAN_PRICING[planId];
      if (!plan) return Response.json({ error: 'Invalid plan.' }, { status: 400 });
      amountCents = plan.amountCents;
      itemName = `ForgeBase ${plan.name} plan`;
    } else if (productId) {
      const products = await base44.asServiceRole.entities.Product.filter({ id: productId });
      product = products[0];
      if (!product || product.active === false) return Response.json({ error: 'Product not found.' }, { status: 404 });
      amountCents = product.priceCents;
      itemName = product.name;
    } else {
      return Response.json({ error: 'Invalid payment request.' }, { status: 400 });
    }

    const env = Deno.env.get('SQUARE_ENVIRONMENT') === 'production' ? 'production' : 'sandbox';
    const baseUrl = env === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';

    const res = await fetch(`${baseUrl}/v2/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('SQUARE_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json',
        'Square-Version': '2025-01-23',
      },
      body: JSON.stringify({
        source_id: sourceId,
        idempotency_key: crypto.randomUUID(),
        amount_money: { amount: amountCents, currency: 'USD' },
        location_id: Deno.env.get('SQUARE_LOCATION_ID'),
        note: `${itemName} — ${user.email}`,
        buyer_email_address: user.email,
      }),
    });
    const body = await res.json();

    if (!res.ok || body.payment?.status === 'FAILED') {
      const detail = body.errors?.[0]?.detail || 'Payment was declined.';
      await base44.asServiceRole.entities.Payment.create({
        userId: user.id, userEmail: user.email, planId: planId || undefined, productId: productId || undefined,
        itemName, amountCents, status: 'failed', errorMessage: detail,
      });
      return Response.json({ error: detail }, { status: 402 });
    }

    const payment = body.payment;
    await base44.asServiceRole.entities.Payment.create({
      userId: user.id,
      userEmail: user.email,
      planId: planId || undefined,
      productId: productId || undefined,
      itemName,
      amountCents,
      currency: 'USD',
      squarePaymentId: payment.id,
      squareReceiptUrl: payment.receipt_url || '',
      status: 'completed',
    });

    // Plan purchases upgrade the user's profile
    if (plan) {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ userId: user.id });
      const planData = {
        plan: planId,
        blueprintLimit: plan.blueprintLimit,
        usagePeriodStart: new Date().toISOString(),
      };
      if (profiles.length > 0) {
        await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, planData);
      } else {
        await base44.asServiceRole.entities.UserProfile.create({
          userId: user.id, email: user.email, fullName: user.full_name, ...planData,
        });
      }
    }

    return Response.json({
      success: true,
      planId: planId || null,
      productId: productId || null,
      itemName,
      receiptUrl: payment.receipt_url || null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});