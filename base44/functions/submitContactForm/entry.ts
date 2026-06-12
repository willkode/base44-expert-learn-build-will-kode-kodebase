import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      subject,
      message,
      status: "new",
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});