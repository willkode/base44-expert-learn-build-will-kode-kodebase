import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Admin-only: scans ALL completed payments in Square and backfills any that are
// missing from the Payment entity, using the same attribution logic as the
// webhook (order metadata → email match → product-name match).

const stripPromo = (n) => (n || '')
  .replace(/\s*\((Summer Special \d+% off|Will's Birthday Sale \d+% off|Pro 40% off|Coupon [A-Z0-9_-]+)\)\s*$/, '')
  .trim();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const envName = Deno.env.get('SQUARE_ENVIRONMENT') === 'production' ? 'production' : 'sandbox';
    const baseUrl = envName === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
    const headers = {
      Authorization: `Bearer ${Deno.env.get('SQUARE_ACCESS_TOKEN')}`,
      'Square-Version': '2025-01-23',
    };

    // 1. Fetch every payment from Square (paginated).
    const squarePayments = [];
    let cursor = null;
    do {
      const url = new URL(`${baseUrl}/v2/payments`);
      url.searchParams.set('limit', '100');
      url.searchParams.set('sort_order', 'DESC');
      if (cursor) url.searchParams.set('cursor', cursor);
      const res = await fetch(url.toString(), { headers });
      const body = await res.json();
      if (!res.ok) {
        return Response.json({ error: `Square payments fetch failed: ${JSON.stringify(body?.errors)}` }, { status: 502 });
      }
      squarePayments.push(...(body.payments || []));
      cursor = body.cursor || null;
    } while (cursor && squarePayments.length < 2000);

    const completed = squarePayments.filter((p) => p.status === 'COMPLETED');

    // 2. Existing Payment records keyed by squarePaymentId.
    const existingPayments = await base44.asServiceRole.entities.Payment.list('-created_date', 2000);
    const existingIds = new Set(existingPayments.map((p) => p.squarePaymentId).filter(Boolean));

    const users = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    const catalog = await base44.asServiceRole.entities.Product.list('-created_date', 500);

    const created = [];
    const skipped = [];

    for (const payment of completed) {
      if (existingIds.has(payment.id)) { skipped.push(payment.id); continue; }

      // Fetch the order for metadata + line items.
      let metadata = {};
      let orderLineItems = [];
      if (payment.order_id) {
        try {
          const orderRes = await fetch(`${baseUrl}/v2/orders/${payment.order_id}`, { headers });
          const orderBody = await orderRes.json();
          if (orderRes.ok) {
            metadata = orderBody?.order?.metadata || {};
            orderLineItems = orderBody?.order?.line_items || [];
          }
        } catch (_e) { /* proceed without order data */ }
      }

      const lineItemName = orderLineItems[0]?.name || '';
      let userId = metadata.base44UserId || null;
      const userEmail = metadata.base44UserEmail || payment.buyer_email_address || '';
      const planId = metadata.planId || null;
      let productId = metadata.productId || null;
      const promptSessionId = metadata.promptSessionId || null;
      const itemName = metadata.itemName || lineItemName || 'Purchase';
      const amountCents = payment.amount_money?.amount || 0;

      if (!userId && userEmail) {
        const match = users.find((u) => (u.email || '').toLowerCase() === userEmail.toLowerCase());
        if (match) userId = match.id;
      }
      if (!productId && !planId && !promptSessionId && !metadata.serviceId && !metadata.donation) {
        const cleanName = stripPromo(metadata.itemName || lineItemName);
        const match = catalog.find((p) => p.name === cleanName);
        if (match) productId = match.id;
      }

      // Cart order — one Payment per line item.
      const cartIds = (metadata.cartProductIds || '').split(',').filter(Boolean);
      if (cartIds.length > 0 || orderLineItems.length > 1) {
        const ids = cartIds.length > 0
          ? cartIds
          : orderLineItems.map((l) => catalog.find((p) => p.name === stripPromo(l.name))?.id).filter(Boolean);
        let first = true;
        for (const pid of ids) {
          const product = catalog.find((p) => p.id === pid);
          if (!product) continue;
          const li = orderLineItems.find((l) => stripPromo(l.name) === product.name);
          await base44.asServiceRole.entities.Payment.create({
            userId: userId || 'external_square',
            userEmail: userEmail || 'unknown',
            productId: pid,
            itemName: li?.name || product.name,
            amountCents: li?.total_money?.amount ?? li?.base_price_money?.amount ?? 0,
            currency: 'USD',
            squarePaymentId: first ? payment.id : `${payment.id}-cart-${pid}`,
            squareReceiptUrl: first ? (payment.receipt_url || '') : '',
            status: 'completed',
            ...(userId ? {} : { errorMessage: 'Synced from Square — no matching app user' }),
          });
          first = false;
        }
        created.push({ id: payment.id, itemName, amountCents, cart: ids.length });
        continue;
      }

      await base44.asServiceRole.entities.Payment.create({
        userId: userId || 'external_square',
        userEmail: userEmail || 'unknown',
        planId: planId || undefined,
        productId: productId || undefined,
        promptSessionId: promptSessionId || undefined,
        itemName,
        amountCents,
        currency: 'USD',
        squarePaymentId: payment.id,
        squareReceiptUrl: payment.receipt_url || '',
        status: 'completed',
        ...(userId ? {} : { errorMessage: 'Synced from Square — no matching app user' }),
      });
      created.push({ id: payment.id, itemName, amountCents, attributed: !!userId });
    }

    return Response.json({
      success: true,
      squareTotal: completed.length,
      alreadyRecorded: skipped.length,
      created: created.length,
      details: created,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});