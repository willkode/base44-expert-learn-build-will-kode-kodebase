import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Claims a $0 product for the logged-in user by creating a completed Payment
// record (the same access mechanism paid products use). Price is verified
// server-side — only products with priceCents === 0 can be claimed.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) return Response.json({ error: 'Missing productId.' }, { status: 400 });

    const products = await base44.asServiceRole.entities.Product.filter({ id: productId });
    const product = products[0];
    if (!product || product.active === false) {
      return Response.json({ error: 'Product not found.' }, { status: 404 });
    }
    if ((product.priceCents || 0) !== 0) {
      return Response.json({ error: 'This product is not free.' }, { status: 400 });
    }

    // Idempotent — if already claimed, just succeed.
    const existing = await base44.asServiceRole.entities.Payment.filter({
      userId: user.id, productId: product.id, status: 'completed',
    });
    if (existing.length > 0) {
      return Response.json({ success: true, alreadyOwned: true, itemName: product.name });
    }

    await base44.asServiceRole.entities.Payment.create({
      userId: user.id,
      userEmail: user.email || '',
      productId: product.id,
      itemName: product.name,
      amountCents: 0,
      currency: 'USD',
      squarePaymentId: `free-${product.id}-${user.id}`,
      status: 'completed',
    });

    return Response.json({ success: true, itemName: product.name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});