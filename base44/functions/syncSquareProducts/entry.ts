import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const env = Deno.env.get('SQUARE_ENVIRONMENT') === 'production' ? 'production' : 'sandbox';
    const baseUrl = env === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
    const headers = {
      Authorization: `Bearer ${Deno.env.get('SQUARE_ACCESS_TOKEN')}`,
      'Content-Type': 'application/json',
      'Square-Version': '2025-01-23',
    };

    const products = await base44.asServiceRole.entities.Product.filter({ active: true });
    const results = [];

    for (const product of products) {
      if (product.squareItemId && product.squareEnvironment === env) {
        results.push({ productId: product.id, name: product.name, status: 'already_synced' });
        continue;
      }

      const upsertRes = await fetch(`${baseUrl}/v2/catalog/object`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          object: {
            type: 'ITEM',
            id: `#product-${product.id}`,
            item_data: {
              name: product.name,
              description: product.tagline || product.description || '',
              variations: [{
                type: 'ITEM_VARIATION',
                id: `#product-${product.id}-default`,
                item_variation_data: {
                  item_id: `#product-${product.id}`,
                  name: 'One-time',
                  pricing_type: 'FIXED_PRICING',
                  price_money: { amount: product.priceCents, currency: 'USD' },
                },
              }],
            },
          },
        }),
      });
      const body = await upsertRes.json();
      if (!upsertRes.ok) {
        return Response.json({ error: `Square error for ${product.name}: ${body.errors?.[0]?.detail || 'unknown'}`, results }, { status: 502 });
      }

      const itemId = body.catalog_object?.id;
      const variationId = body.catalog_object?.item_data?.variations?.[0]?.id;
      await base44.asServiceRole.entities.Product.update(product.id, {
        squareItemId: itemId,
        squareVariationId: variationId,
        squareEnvironment: env,
      });
      results.push({ productId: product.id, name: product.name, status: 'created', squareItemId: itemId, squareVariationId: variationId });
    }

    return Response.json({ environment: env, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});