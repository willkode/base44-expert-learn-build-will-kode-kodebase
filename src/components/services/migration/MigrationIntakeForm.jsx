import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { trackFormStart, trackFormSubmit, trackFormError, trackLead } from "@/lib/analytics";

// Post-payment intake form — collects the details Will needs to start the migration.
export default function MigrationIntakeForm() {
  const [form, setForm] = useState({ name: "", email: "", appUrl: "", details: "", website: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const startedRef = React.useRef(false);

  const set = (field) => (e) => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackFormStart("migration_intake_form");
    }
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await base44.functions.invoke("submitContactForm", {
        name: form.name,
        email: form.email,
        phone: "",
        subject: "Base44 Migration — Paid Intake",
        message: `PAID MIGRATION INTAKE\n\nApp URL: ${form.appUrl}\n\nDetails:\n${form.details}`,
        website: form.website,
      });
      if (res.data?.error) {
        setError(res.data.error);
        trackFormError("migration_intake_form", res.data.error);
      } else {
        setSent(true);
        trackFormSubmit("migration_intake_form");
        trackLead({ leadType: "migration_paid_intake", formName: "migration_intake_form" });
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong. Please try again.";
      setError(msg);
      trackFormError("migration_intake_form", msg);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="font-sora font-bold text-xl mb-2">Details received!</h3>
        <p className="text-muted-foreground text-sm">
          I have your migration details and will reach out within 24 hours to kick things off.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="intake-name">Name</Label>
          <Input id="intake-name" value={form.name} onChange={set("name")} placeholder="Your name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="intake-email">Email</Label>
          <Input id="intake-email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="intake-app-url">Your Base44 app URL</Label>
        <Input id="intake-app-url" value={form.appUrl} onChange={set("appUrl")} placeholder="https://your-app.base44.app" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="intake-details">Tell me about your app</Label>
        <Textarea
          id="intake-details"
          value={form.details}
          onChange={set("details")}
          placeholder="What does your app do? Rough user count, payments, integrations, preferred stack or hosting, timeline — anything that helps me plan your migration."
          rows={6}
          required
        />
      </div>
      {/* Honeypot field — hidden from real users */}
      <input
        type="text"
        value={form.website}
        onChange={set("website")}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={sending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send My Migration Details"}
      </Button>
    </form>
  );
}