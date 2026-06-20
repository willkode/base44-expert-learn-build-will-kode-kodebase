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

    // Generate signed URLs for each product's PDF
    const links = [];
    for (const product of selected) {
      if (!product.pdfFileUri) continue;
      const result = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
        file_uri: product.pdfFileUri,
        expires_in: 60 * 60 * 24 * 7, // 7 days
      });
      links.push({ name: product.name, url: result.signed_url, fileName: product.pdfFileName });
    }

    if (links.length === 0) {
      return Response.json({ error: 'No PDFs available for selected products' }, { status: 404 });
    }

    // Build email HTML
    const linksHtml = links.map(l =>
      `<div style="margin:16px 0;padding:16px;background:#111827;border-radius:10px;border:1px solid #1e293b;">
        <a href="${l.url}" style="color:#fb923c;font-weight:600;font-size:15px;text-decoration:none;">📄 Download ${l.name}</a>
        <p style="color:#64748b;font-size:12px;margin:4px 0 0;">${l.fileName} · Link valid for 7 days</p>
      </div>`
    ).join('');

    const html = `
      <div style="background:#0d1326;color:#f8fafc;font-family:Inter,sans-serif;padding:40px 32px;max-width:600px;margin:0 auto;border-radius:16px;">
        <h1 style="color:#fb923c;font-size:24px;margin:0 0 8px;">Your KodeBase Download${links.length > 1 ? 's' : ''}</h1>
        <p style="color:#94a3b8;margin:0 0 28px;font-size:15px;">Here are your product files. Each download link is valid for <strong style="color:#f8fafc;">7 days</strong>.</p>
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