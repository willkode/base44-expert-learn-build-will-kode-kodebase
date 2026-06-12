import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTIFY_EMAIL = "iamwillkode@gmail.com";

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function buildEmailHtml({ name, email, phone, subject, message }) {
  const row = (label, value) => `
    <tr>
      <td style="padding:10px 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fb923c;vertical-align:top;width:110px;">${label}</td>
      <td style="padding:10px 16px;font-size:14px;color:#e2e8f0;vertical-align:top;">${value}</td>
    </tr>`;

  return `
  <div style="background-color:#0a0f1e;padding:40px 16px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;">
      <div style="background:linear-gradient(90deg,#f87171,#fb923c,#facc15);height:4px;border-radius:4px 4px 0 0;"></div>
      <div style="background-color:#0d1326;border:1px solid #1e2a45;border-top:none;border-radius:0 0 12px 12px;padding:32px;">
        <h1 style="margin:0 0 4px;font-size:20px;color:#ffffff;">New Contact Form Submission</h1>
        <p style="margin:0 0 24px;font-size:13px;color:#94a3b8;">Someone reached out via the KodeBase contact page.</p>
        <table style="width:100%;border-collapse:collapse;background-color:#101a33;border:1px solid #1e2a45;border-radius:8px;overflow:hidden;">
          ${row("Name", escapeHtml(name))}
          ${row("Email", `<a href="mailto:${escapeHtml(email)}" style="color:#fb923c;text-decoration:none;">${escapeHtml(email)}</a>`)}
          ${phone ? row("Phone", escapeHtml(phone)) : ""}
          ${subject ? row("Subject", escapeHtml(subject)) : ""}
        </table>
        <div style="margin-top:20px;background-color:#101a33;border:1px solid #1e2a45;border-radius:8px;padding:16px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fb923c;">Message</p>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#e2e8f0;white-space:pre-wrap;">${escapeHtml(message)}</p>
        </div>
        <p style="margin:24px 0 0;font-size:12px;color:#64748b;text-align:center;">Reply directly to this email to respond to ${escapeHtml(name)}.</p>
      </div>
    </div>
  </div>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Honeypot — silently accept bot submissions without saving
    if (body.website) {
      return Response.json({ success: true });
    }

    const name = String(body.name || "").trim().slice(0, 100);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 200);
    const phone = String(body.phone || "").trim().slice(0, 30);
    const subject = String(body.subject || "").trim().slice(0, 200);
    const message = String(body.message || "").trim().slice(0, 5000);

    if (!name || name.length < 2) {
      return Response.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!message || message.length < 10) {
      return Response.json({ error: "Please enter a message (at least 10 characters)." }, { status: 400 });
    }

    await base44.asServiceRole.entities.ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message,
      status: "new",
    });

    // Send stylized notification email via Resend
    try {
      const settingsList = await base44.asServiceRole.entities.EmailSettings.filter({ key: "global" });
      const settings = settingsList[0] || {};
      const fromName = settings.resendFromName || "KodeBase";
      const fromEmail = settings.resendFromEmail || "onboarding@resend.dev";

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [NOTIFY_EMAIL],
          reply_to: email,
          subject: `New Contact: ${subject || name}`,
          html: buildEmailHtml({ name, email, phone, subject, message }),
        }),
      });
      if (!resendRes.ok) {
        console.error("Resend notification failed:", await resendRes.text());
      }
    } catch (notifyError) {
      console.error("Notification email error:", notifyError.message);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});