import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Star } from "lucide-react";

const KEY_EVENTS = [
  { name: "purchase", why: "Revenue — plan & product payments via Square checkout. Includes value, currency, transaction_id.", priority: "Primary" },
  { name: "generate_lead", why: "Contact form submissions — your main lead pipeline.", priority: "Primary" },
  { name: "sign_up", why: "Account creation (email or Google) — top of the product funnel.", priority: "Primary" },
  { name: "begin_checkout", why: "Checkout page reached — measures pricing → payment drop-off.", priority: "Secondary" },
  { name: "newsletter_signup", why: "Email capture from the prompt library gate.", priority: "Secondary" },
];

const EVENTS = [
  { name: "page_view", where: "Every route change (SPA-safe, no double counting)", params: "page_path, page_title, page_location" },
  { name: "cta_click", where: "Hero: Start Learning, View Blueprint Tool", params: "cta_text, cta_location, cta_destination, page_path" },
  { name: "pricing_plan_click", where: "Pricing cards (Free / Solo / Pro)", params: "plan_id, plan_name, price" },
  { name: "select_item", where: "Products page — Buy Now", params: "items (id, name, category, price), value, currency" },
  { name: "begin_checkout", where: "Checkout page load (plan or product)", params: "items, value, currency" },
  { name: "purchase", where: "Successful Square payment", params: "transaction_id, items, value, currency" },
  { name: "form_start", where: "Contact form — first keystroke", params: "form_name, page_path" },
  { name: "form_submit", where: "Contact form — successful submit", params: "form_name, page_path" },
  { name: "form_error", where: "Contact form — validation/server error", params: "form_name, error_reason" },
  { name: "generate_lead", where: "Contact form — successful submit", params: "lead_type, form_name, page_path" },
  { name: "sign_up", where: "Register — email OTP verified, or Google click", params: "method" },
  { name: "login", where: "Login — email success, or Google click", params: "method" },
  { name: "newsletter_signup", where: "Prompt library email gate", params: "signup_source" },
];

const FUNNELS = [
  "Homepage → cta_click (hero) → sign_up",
  "Homepage → pricing_plan_click → begin_checkout → purchase",
  "Products → select_item → begin_checkout → purchase",
  "Contact page → form_start → form_submit → generate_lead",
  "Prompt Library → newsletter_signup → sign_up",
];

export default function AdminAnalyticsPlan() {
  return (
    <div>
      <PageHeader
        title="Google Analytics Tracking Plan"
        description="Measurement ID G-XNVRC522DF — installed once in the site head, with SPA route tracking."
      />

      <div className="space-y-8">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-sora font-bold text-lg mb-1 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" /> Mark these as Key Events in GA4
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            GA4 → Admin → Events → toggle "Mark as key event" for each name below.
          </p>
          <div className="space-y-3">
            {KEY_EVENTS.map((e) => (
              <div key={e.name} className="flex items-start gap-3">
                <Badge variant={e.priority === "Primary" ? "default" : "secondary"} className="mt-0.5 shrink-0">{e.priority}</Badge>
                <div>
                  <code className="text-sm font-semibold text-primary">{e.name}</code>
                  <p className="text-sm text-muted-foreground">{e.why}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-sora font-bold text-lg mb-4">All tracked events</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4 font-medium">Event</th>
                  <th className="py-2 pr-4 font-medium">Fires when</th>
                  <th className="py-2 font-medium">Parameters</th>
                </tr>
              </thead>
              <tbody>
                {EVENTS.map((e) => (
                  <tr key={e.name + e.where} className="border-b border-border/50">
                    <td className="py-2.5 pr-4"><code className="text-primary">{e.name}</code></td>
                    <td className="py-2.5 pr-4">{e.where}</td>
                    <td className="py-2.5 text-muted-foreground">{e.params}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-sora font-bold text-lg mb-4">Tracked funnels</h2>
          <ul className="space-y-2">
            {FUNNELS.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-sora font-bold text-lg mb-3">How to test</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Open GA4 → Reports → Realtime, then browse the published site — page views should appear within seconds.</li>
            <li>For event detail, use GA4 → Admin → DebugView with the Google Analytics Debugger browser extension enabled.</li>
            <li>Click a hero CTA, a pricing card, and submit the contact form — watch cta_click, pricing_plan_click, form_submit, and generate_lead arrive.</li>
            <li>Complete a sandbox checkout to verify begin_checkout and purchase with value and transaction_id.</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-4">
            Privacy: no names, emails, phone numbers, message content, or card details are ever sent to Google Analytics — only event names, routes, plan/product identifiers, and prices.
          </p>
        </section>
      </div>
    </div>
  );
}