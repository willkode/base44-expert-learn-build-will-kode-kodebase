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

    const { bundleOnly = false } = await req.json();
    const payments = await base44.asServiceRole.entities.Payment.filter(
      { userId: user.id, status: 'completed' },
      '-created_date',
      500
    );
    const all = await base44.asServiceRole.entities.Product.list('-created_date', 500);
    const purchasedIds = [...new Set(payments.map((p) => p.productId).filter(Boolean))];
    const bundle = all.find((p) => p.slug === 'complete-builder-bundle');
    const hasBundle = !!bundle && purchasedIds.includes(bundle.id);
    if (bundleOnly && !hasBundle) {
      return Response.json({ error: 'Complete Builder Bundle access is required.' }, { status: 403 });
    }

    const productIds = bundleOnly
      ? all.filter((p) => p.active !== false && p.slug !== 'complete-builder-bundle' && p.slug !== 'complete-base44-knowledge-kit' && (p.priceCents || 0) > 0).map((p) => p.id)
      : purchasedIds;
    if (productIds.length === 0) return Response.json({ products: [] });

    const owned = all
      .filter((p) => productIds.includes(p.id))
      .filter((p) => p.slug !== 'prompt-vault')
      .filter((p) => !bundleOnly || (p.deliversPdf && ((p.pdfFiles || []).some((f) => f?.fileUri) || p.pdfFileUri)))
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        tagline: p.tagline,
        imageUrl: p.imageUrl,
        deliversPdf: !!p.deliversPdf,
        fileCount: (p.pdfFiles || []).filter((f) => f?.fileUri).length || (p.pdfFileUri ? 1 : 0),
      }));

    return Response.json({ products: owned });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});