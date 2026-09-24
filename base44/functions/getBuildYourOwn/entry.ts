import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Single source of truth for Build Your Own access ($5 one-time, lifetime).
// Access = admin, or a completed Payment for the Build Your Own product.
// BuildTutorial RLS only lets admins read directly, so buyers get the guides
// served here; everyone else gets a link-free preview (counts + sample titles).
const PRODUCT_SLUG = 'build-your-own-lifetime';
const SAMPLES_PER_CATEGORY = 3;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // auth.me() throws for anonymous visitors — the page is public, so treat
    // that as "no access" rather than an error.
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

    const tutorials = await base44.asServiceRole.entities.BuildTutorial.filter({ published: true }, 'title', 2000);

    if (via) {
      // Only display fields go to the browser — internal fields (e.g. source) stay server-side.
      const guides = tutorials.map(({ id, title, url, category, languages, description, isVideo, featured }) =>
        ({ id, title, url, category, languages, description, isVideo, featured }));
      return Response.json({ hasAccess: true, via, signedIn: true, product: productInfo, tutorials: guides });
    }

    // Preview — never includes URLs.
    const categories = {};
    const languages = {};
    for (const t of tutorials) {
      const c = (categories[t.category] ||= { name: t.category, count: 0, samples: [] });
      c.count += 1;
      if (c.samples.length < SAMPLES_PER_CATEGORY) c.samples.push(t.title);
      for (const l of t.languages || []) languages[l] = (languages[l] || 0) + 1;
    }

    return Response.json({
      hasAccess: false,
      via: null,
      signedIn: !!user,
      product: productInfo,
      total: tutorials.length,
      categories: Object.values(categories),
      languages: Object.keys(languages).sort((a, b) => languages[b] - languages[a]),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
