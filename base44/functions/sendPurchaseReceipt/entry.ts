import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.2.1';

// Generates a professional PDF receipt and emails it via Resend. Called
// internally right after a completed Square payment is recorded — not meant
// to be user-invoked, but still requires a valid app auth context since it
// runs via base44.asServiceRole.functions.invoke from the webhook.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { email, itemName, amountCents, paymentId, purchaseDate } = await req.json();
    if (!email || !itemName || amountCents == null || !paymentId) {
      return Response.json({ error: 'email, itemName, amountCents and paymentId are required' }, { status: 400 });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const settingsRows = await base44.asServiceRole.entities.EmailSettings.filter({ key: 'global' });
    const settings = settingsRows[0];
    const fromEmail = settings?.resendFromEmail || 'hello@kodebase.us';
    const fromName = settings?.resendFromName || 'KodeBase';

    const amount = (amountCents / 100).toFixed(2);
    const dateLabel = new Date(purchaseDate || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    // Build the PDF receipt
    const doc = new jsPDF();
    doc.setFillColor(13, 19, 38);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(251, 146, 60);
    doc.setFontSize(22);
    doc.text('KodeBase', 20, 25);

    doc.setTextColor(248, 250, 252);
    doc.setFontSize(16);
    doc.text('Payment Receipt', 20, 40);

    doc.setDrawColor(30, 41, 59);
    doc.line(20, 46, 190, 46);

    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    let y = 60;
    const row = (label, value) => {
      doc.setTextColor(148, 163, 184);
      doc.text(label, 20, y);
      doc.setTextColor(248, 250, 252);
      doc.text(String(value), 90, y);
      y += 10;
    };
    row('Date', dateLabel);
    row('Item', itemName);
    row('Amount Paid', `$${amount} USD`);
    row('Payment ID', paymentId);
    row('Billed To', email);

    doc.setDrawColor(30, 41, 59);
    doc.line(20, y + 4, 190, y + 4);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text('Thank you for your purchase. Questions? Contact us at kodebase.com/contact', 20, y + 16);

    const pdfBase64 = doc.output('datauristring').split(',')[1];

    const html = `
      <div style="background:#0d1326;color:#f8fafc;font-family:Inter,sans-serif;padding:40px 32px;max-width:600px;margin:0 auto;border-radius:16px;">
        <h1 style="color:#fb923c;font-size:22px;margin:0 0 8px;">Thanks for your purchase!</h1>
        <p style="color:#94a3b8;margin:0 0 24px;font-size:15px;">Your receipt for <strong style="color:#f8fafc;">${itemName}</strong> ($${amount}) is attached as a PDF.</p>
        <p style="color:#475569;font-size:12px;margin:0;">Questions? Contact us at <a href="https://kodebase.com/contact" style="color:#fb923c;">kodebase.com/contact</a></p>
      </div>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [email],
        subject: `Your Receipt — ${itemName}`,
        html,
        attachments: [
          { filename: 'receipt.pdf', content: pdfBase64 },
        ],
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      return Response.json({ error: resendData.message || 'Failed to send receipt' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});