import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Calculator, CheckCircle2, CalendarClock } from "lucide-react";
import ServiceCheckoutButton from "@/components/services/ServiceCheckoutButton";
import { trackEvent, trackFormStart, trackFormSubmit, trackLead } from "@/lib/analytics";

export const MIGRATION_START_PRICE = 199;
const FLAT_RATE_LIMIT = 100;
const BOOKING_URL = "https://calendar.app.google/HkWivU8RSamGuGUcA";

// Instant migration quote: apps with fewer than 100 pages + backend functions
// are a flat $199 and can pay immediately. Larger apps book a call for a custom quote.
export default function MigrationQuoteTool() {
  const [form, setForm] = useState({ name: "", email: "", appUrl: "", pages: "", functions: "", notes: "", website: "" });
  const [quote, setQuote] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const started = React.useRef(false);

  const set = (field) => (e) => {
    if (!started.current) {
      started.current = true;
      trackFormStart("migration_quote_tool");
    }
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const total = Number(form.pages || 0) + Number(form.functions || 0);
    if (!Number.isFinite(total) || total <= 0) {
      setError("Enter how many pages and backend functions your app has.");
      return;
    }
    const flatRate = total < FLAT_RATE_LIMIT;
    setSending(true);
    try {
      await base44.functions.invoke("submitContactForm", {
        name: form.name,
        email: form.email,
        phone: "",
        subject: flatRate ? "Migration Quote — $199 flat rate" : "Migration Quote — custom quote needed",
        message: `MIGRATION QUOTE REQUEST\n\nApp URL: ${form.appUrl}\nPages: ${form.pages}\nBackend functions: ${form.functions}\nTotal: ${total}\nQuote: ${flatRate ? "$199 flat rate" : "Custom — call required"}\n\nNotes:\n${form.notes || "—"}`,
        website: form.website,
      });
      trackFormSubmit("migration_quote_tool");
      trackLead({ leadType: flatRate ? "migration_quote_flat" : "migration_quote_custom", formName: "migration_quote_tool" });
      trackEvent("migration_quote_generated", { total_items: total, quote_type: flatRate ? "flat_199" : "custom" });
      setQuote({ total, flatRate });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (quote) {
    return (
      <div className="rounded-2xl border border-primary/40 bg-card p-8 text-center glow-orange">
        {quote.flatRate ? (
          <>
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-sora font-bold text-2xl mb-2">
              Your migration: <span className="text-gradient-orange">${MIGRATION_START_PRICE}</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {quote.total} pages and backend functions puts your app inside our automated migration path — flat ${MIGRATION_START_PRICE}, no custom quote needed. Pay now and you'll fill out a short intake form right after checkout.
            </p>
            <div className="max-w-sm mx-auto">
              <ServiceCheckoutButton
                serviceId="base44_migration"
                label={`Pay & Start Your Migration — $${MIGRATION_START_PRICE}`}
                redirectPath="/services/migration-intake"
                onClick={() => trackEvent("service_cta_click", { service: "base44_migration", cta: "quote_tool_pay" })}
              />
            </div>
          </>
        ) : (
          <>
            <CalendarClock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-sora font-bold text-2xl mb-2">Let's scope this one together.</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              At {quote.total} pages and backend functions your app is past our automated path, so it needs a custom quote. Grab a time with me and I'll walk your app with you and price the migration exactly.
            </p>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("service_cta_click", { service: "base44_migration", cta: "quote_tool_book_call" })}
            >
              <Button size="lg" className="font-semibold px-8">
                Schedule My Quote Call
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-4">Your app details are already with me — I'll come to the call prepared.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="w-5 h-5 text-primary" />
        <p className="font-sora font-bold text-lg">Get your migration quote</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="q-name">Name</Label>
          <Input id="q-name" value={form.name} onChange={set("name")} placeholder="Your name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="q-email">Email</Label>
          <Input id="q-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="q-app">Your Base44 app URL</Label>
        <Input id="q-app" value={form.appUrl} onChange={set("appUrl")} placeholder="https://your-app.base44.app" required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="q-pages">How many pages?</Label>
          <Input id="q-pages" type="number" min="0" value={form.pages} onChange={set("pages")} placeholder="e.g. 24" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="q-functions">How many backend functions?</Label>
          <Input id="q-functions" type="number" min="0" value={form.functions} onChange={set("functions")} placeholder="e.g. 12" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="q-notes">Anything else? (optional)</Label>
        <Textarea id="q-notes" rows={3} value={form.notes} onChange={set("notes")} placeholder="Payments, integrations, realtime features, preferred stack or hosting, timeline." />
      </div>
      <input type="text" value={form.website} onChange={set("website")} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={sending} className="w-full font-semibold">
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get My Quote"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Under {FLAT_RATE_LIMIT} pages + backend functions = flat ${MIGRATION_START_PRICE}. Larger apps get a custom quote on a call.
      </p>
    </form>
  );
}