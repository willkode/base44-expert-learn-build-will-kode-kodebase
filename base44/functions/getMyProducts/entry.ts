import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns the list of products the calling user owns (has a completed Payment
// with a productId for). Resolved entirely server-side with the service role so
// the dashboard "My Products" section never depends on client-side RLS read
// edge cases (e.g. records created_by an admin when access is granted manually).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payments = await base44.asServiceRole.entities.Payment.filter(
      { userId: user.id, status: 'completed' },
      '-created_date',
      500
    );
    const productIds = [...new Set(payments.map((p) => p.productId).filter(Boolean))];
    if (productIds.length === 0) {
      return Response.json({ products: [] });
    }

    const all = await base44.asServiceRole.entities.Product.list('-created_date', 500);
    const owned = all
      .filter((p) => productIds.includes(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        tagline: p.tagline,
        imageUrl: p.imageUrl,
        deliversPdf: !!p.deliversPdf,
      }));

    return Response.json({ products: owned });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});