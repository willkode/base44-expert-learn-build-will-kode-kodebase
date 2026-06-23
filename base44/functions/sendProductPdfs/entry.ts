import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { email, productIds } = await req.json();
    if (!email || !productIds || productIds.length === 0) {
      return Response.json({ error: 'email and productIds are required' }, { status: 400 });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    // Fetch all requested products
    const products = await base44.asServiceRole.entities.Product.filter({ deliversPdf: true });
    const selected = products.filter(p => productIds.includes(p.id));

    if (selected.length === 0) {
      return Response.json({ error: 'No matching PDF products found' }, { status: 404 });
    }

    // Email a link back to the in-app Download page instead of raw signed media
    // URLs. Raw signed URLs expire and fail ("token validation failed") once the
    // email sits in an inbox; the Download page always mints fresh valid links
    // for the authenticated buyer.
    const appBase = (Deno.env.get('APP_PUBLIC_URL') || 'https://kodebase.us').replace(/\/$/, '');
    const links = selected.map((product) => ({
      name: product.name,
      url: `${appBase}/download/${product.id}`,
    }));

    // Build email HTML
    const linksHtml = links.map(l =>
      `<div style="margin:16px 0;padding:16px;background:#111827;border-radius:10px;border:1px solid #1e293b;">
        <a href="${l.url}" style="color:#fb923c;font-weight:600;font-size:15px;text-decoration:none;">📄 Download ${l.name}</a>
        <p style="color:#64748b;font-size:12px;margin:4px 0 0;">Opens your secure download page</p>
      </div>`
    ).join('');

    const html = `
      <div style="background:#0d1326;color:#f8fafc;font-family:Inter,sans-serif;padding:40px 32px;max-width:600px;margin:0 auto;border-radius:16px;">
        <h1 style="color:#fb923c;font-size:24px;margin:0 0 8px;">Your KodeBase Download${links.length > 1 ? 's' : ''}</h1>
        <p style="color:#94a3b8;margin:0 0 28px;font-size:15px;">Tap a product below to open your secure download page and grab your files.</p>
        ${linksHtml}
        <hr style="border:none;border-top:1px solid #1e293b;margin:32px 0;" />
        <p style="color:#475569;font-size:12px;margin:0;">Questions? Contact us at <a href="https://kodebase.com/contact" style="color:#fb923c;">kodebase.com/contact</a></p>
      </div>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'KodeBase <hello@kodebase.us>',
        to: [email],
        subject: `Your KodeBase Download${links.length > 1 ? 's' : ''} — ${links.map(l => l.name).join(', ')}`,
        html,
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      return Response.json({ error: resendData.message || 'Failed to send email' }, { status: 500 });
    }

    return Response.json({ success: true, sent: links.length, products: links.map(l => l.name) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});