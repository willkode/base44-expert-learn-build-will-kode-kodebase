import React, { useState } from "react";
import { Loader2, CheckCircle2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { trackEvent } from "@/lib/analytics";

export default function DesktopEarlyAccess() {
  const [form, setForm] = useState({ name: "", email: "", useCase: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { setError("Please enter your email address."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("joinEarlyAccess", { ...form, product: "base44-desktop-ide" });
      if (res.data?.success) {
        trackEvent("early_access_signup", { product: "base44-desktop-ide" });
        setDone(true);
      } else {
        setError(res.data?.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <section id="early-access" className="py-16 md:py-24 px-6 blueprint-grid">
      <div className="max-w-xl mx-auto rounded-2xl border border-primary/40 bg-card p-8 md:p-10 glow-orange">
        {done ? (
          <div className="text-center">
            <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
            <h2 className="font-sora font-bold text-2xl mb-3">You are on the list.</h2>
            <p className="text-muted-foreground text-sm">
              We will send you product updates, development previews, and early-access availability as Base44 Desktop moves closer to launch.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <Rocket className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="font-sora font-bold text-2xl md:text-3xl mb-3">
                Help shape the desktop workspace Base44 developers have been missing.
              </h2>
              <p className="text-muted-foreground text-sm">
                Join the early-access list to receive product updates, development previews, launch availability, and opportunities to provide feedback before the public release.
              </p>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input type="email" required placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Textarea placeholder="Primary Base44 use case" rows={3} value={form.useCase} onChange={(e) => setForm({ ...form, useCase: e.target.value })} />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
              >
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</> : "Request Early Access"}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">No spam. Only product updates and early-access announcements.</p>
            </form>
          </>
        )}
      </div>
    </section>
  );
}