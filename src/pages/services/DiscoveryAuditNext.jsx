import React, { useState, useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, UserPlus, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { trackEvent } from "@/lib/analytics";

const WILL_EMAIL = "iamwillkode@gmail.com";

export default function DiscoveryAuditNext() {
  const [form, setForm] = useState({ name: "", email: "", appUrl: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackEvent("service_purchase_complete", { service: "discovery_audit" });
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await base44.functions.invoke("submitContactForm", {
        name: form.name,
        email: form.email,
        message: `DISCOVERY AUDIT — new order\n\nApp URL: ${form.appUrl || "Not provided"}\n\nNotes: ${form.notes || "None"}`,
      });
      trackEvent("discovery_audit_details_submit", {});
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(WILL_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Seo title="Discovery Audit — Next Steps | KodeBase" description="Your Discovery Audit is confirmed. Send your app details and add Will as a collaborator." path="/services/discovery-audit/next" noindex />
      <section className="relative pt-32 pb-24 blueprint-grid">
        <div className="max-w-lg mx-auto px-6">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-sora font-extrabold text-3xl tracking-tight mb-2">
              Payment received. <span className="text-gradient-orange">Two quick steps.</span>
            </h1>
            <p className="text-muted-foreground text-sm">Send your details, then add me as a collaborator so I can start the audit.</p>
          </div>

          {/* Step 1 — details form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-8 mb-6">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">Step 1 — Your details</p>
            {sent ? (
              <div className="flex items-center gap-3 text-sm text-foreground">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Details received — I'll confirm by email shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Your name <span className="text-primary">*</span></label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Jane Smith"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Your email <span className="text-primary">*</span></label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Your app URL <span className="text-primary">*</span></label>
                  <input name="appUrl" value={form.appUrl} onChange={handleChange} required placeholder="https://yourapp.base44.app"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">What should I pay closest attention to? <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                    placeholder="Known issues, areas you're unsure about, launch plans…"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground resize-none" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" size="lg" className="w-full font-semibold" disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</> : <>Send my details <ArrowRight className="w-4 h-4 ml-1" /></>}
                </Button>
              </form>
            )}
          </motion.div>

          {/* Step 2 — collaborator */}
          <div className="rounded-2xl border-2 border-primary/50 bg-primary/5 p-8">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">Step 2 — Action required</p>
            <div className="flex items-start gap-3 mb-5">
              <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/90 leading-relaxed">
                The audit can't start until I have access to your app. Add me as a collaborator in Base44 —
                open your app → <span className="font-semibold">Users</span> → invite the email below.
              </p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-background/40 p-4 mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Invite this email</p>
                <p className="font-sora font-bold">{WILL_EMAIL}</p>
              </div>
              <Button size="sm" variant="outline" onClick={copyEmail} className="shrink-0">
                {copied ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-400" />Copied</> : "Copy"}
              </Button>
            </div>
            <div className="space-y-3">
              {[
                "Open your app in the Base44 editor.",
                'Click the "+" button next to your profile avatar (top-right).',
                `Enter ${WILL_EMAIL} and send the invite.`,
                "I'll accept and begin the review — expect the report within 3–5 business days.",
              ].map((text, i) => (
                <div key={text} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <UserPlus className="w-3.5 h-3.5 text-primary" />
              Can't find the option? Reply to your receipt email and I'll walk you through it.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}