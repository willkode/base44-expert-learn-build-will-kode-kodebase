import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// One Build Your Own guide page. Buyers and admins get the full guide
// (write-up, source link, credit); everyone else gets a teaser plus what the
// unlock card needs. Access rules mirror getBuildYourOwn.
const PRODUCT_SLUG = 'build-your-own-lifetime';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { slug } = await req.json();
    if (!slug) return Response.json({ error: 'slug is required' }, { status: 400 });

    const user = await base44.auth.me().catch(() => null);
    const [product] = await base44.asServiceRole.entities.Product.filter({ slug: PRODUCT_SLUG });
    const productInfo = product
      ? { id: product.id, name: product.name, priceCents: product.priceCents, active: product.active !== false }
      : null;

    let via = null;
    if (user?.role === 'admin') {
      via = 'admin';
    } else if (user && product) {
      const payments = await base44.asServiceRole.entities.Payment.filter(
        { userId: user.id, productId: product.id, status: 'completed' },
        '-created_date',
        1
      );
      if (payments.length > 0) via = 'purchase';
    }

    const [g] = await base44.asServiceRole.entities.BuildTutorial.filter({ slug, published: true });
    const base = { hasAccess: !!via, via, signedIn: !!user, product: productInfo };
    if (!g) return Response.json({ ...base, notFound: true });

    const teaser = {
      id: g.id,
      slug: g.slug,
      title: g.title,
      category: g.category,
      languages: g.languages || [],
      description: g.description || '',
      difficulty: g.difficulty || '',
      timeEstimate: g.timeEstimate || '',
      isVideo: !!g.isVideo,
    };

    if (via) {
      return Response.json({
        ...base,
        guide: { ...teaser, url: g.url, writeup: g.writeup || '', sourceName: g.sourceName || '' },
      });
    }

    const all = await base44.asServiceRole.entities.BuildTutorial.filter({ published: true }, 'title', 2000);
    return Response.json({
      ...base,
      total: all.length,
      categoryCount: new Set(all.map((t) => t.category)).size,
      guide: teaser,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
