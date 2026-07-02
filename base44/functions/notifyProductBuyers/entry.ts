import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only: emails every buyer of a product about an update to it.
// Buyers are resolved from completed Payment records for the product.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { productId, updateNote } = await req.json();
    if (!productId || !updateNote) {
      return Response.json({ error: 'Missing productId or updateNote.' }, { status: 400 });
    }

    const products = await base44.asServiceRole.entities.Product.filter({ id: productId });
    const product = products[0];
    if (!product) return Response.json({ error: 'Product not found.' }, { status: 404 });

    const payments = await base44.asServiceRole.entities.Payment.filter(
      { productId, status: 'completed' }, '-created_date', 500
    );
    const emails = [...new Set(
      payments.map((p) => (p.userEmail || '').trim().toLowerCase()).filter((e) => e.includes('@'))
    )];

    let sent = 0;
    const failures = [];
    for (const to of emails) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to,
          from_name: 'KodeBase',
          subject: `${product.name} just got an update`,
          body: `Good news — ${product.name} has been updated, and as a buyer you get every update free.\n\nWhat's new:\n${updateNote}\n\nDownload the latest version anytime from your dashboard under My Products:\n${Deno.env.get('APP_PUBLIC_URL') || ''}/dashboard\n\n— The KodeBase team`,
        });
        sent += 1;
      } catch (e) {
        failures.push({ to, error: e.message });
      }
    }

    return Response.json({ success: true, sent, totalBuyers: emails.length, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});