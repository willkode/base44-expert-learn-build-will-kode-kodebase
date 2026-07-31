// Normalizes every "contact form" submission source into one CRM row shape.
import { base44 } from "@/api/base44Client";

export const SOURCE_LABELS = {
  contact: "Contact form",
  newsletter: "Newsletter",
  early_access: "Early access",
};

export async function loadCrmSubmissions() {
  const [messages, subscribers, earlyAccess] = await Promise.all([
    base44.entities.ContactMessage.list("-created_date", 500),
    base44.entities.NewsletterSubscriber.list("-created_date", 500),
    base44.entities.EarlyAccessSignup.list("-created_date", 500),
  ]);

  const rows = [
    ...messages.map((m) => ({
      id: m.id,
      source: "contact",
      name: m.name || "",
      email: m.email || "",
      phone: m.phone || "",
      subject: m.subject || "",
      message: m.message || "",
      status: m.status || "new",
      created_date: m.created_date,
    })),
    ...subscribers.map((s) => ({
      id: s.id,
      source: "newsletter",
      name: "",
      email: s.email || "",
      phone: "",
      subject: "Newsletter signup",
      message: s.source ? `Signed up from: ${s.source}` : "",
      status: "",
      created_date: s.created_date,
    })),
    ...earlyAccess.map((e) => ({
      id: e.id,
      source: "early_access",
      name: e.name || "",
      email: e.email || "",
      phone: "",
      subject: e.product ? `Early access — ${e.product}` : "Early access",
      message: e.useCase ? `Use case: ${e.useCase}` : "",
      status: "",
      created_date: e.created_date,
    })),
  ];

  return rows.sort(
    (a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)
  );
}