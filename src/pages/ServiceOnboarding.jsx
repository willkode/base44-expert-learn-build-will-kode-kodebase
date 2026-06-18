import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2, UserPlus, Plus, MoreHorizontal, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { trackEvent } from "@/lib/analytics";

const WILL_EMAIL = "iamwillkode@gmail.com";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08 } }),
};

export default function ServiceOnboarding() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get("service") || "";

  const [step, setStep] = useState(1); // 1 = contact form, 2 = collaborator instructions
  const [form, setForm] = useState({ name: "", email: "", appUrl: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackEvent("page_view", { page: "service_onboarding", serviceId });
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await base44.functions.invoke("submitContactForm", {
        name: form.name,
        email: form.email,
        message: `SERVICE ONBOARDING — ${serviceId}\n\nApp URL: ${form.appUrl || "Not provided"}\n\nNotes: ${form.notes || "None"}`,
      });
      trackEvent("service_onboarding_form_submit", { serviceId });
      setStep(2);
    } catch (err) {
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
    <div className="min-h-screen bg-background blueprint-grid flex items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 2 && <div className={`flex-1 h-0.5 transition-colors ${step > s ? "bg-primary" : "bg-border"}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" />
                <h1 className="font-sora font-bold text-2xl mb-1">Payment confirmed!</h1>
                <p className="text-muted-foreground text-sm">Let's get started. Share a few details so Will can prepare for your service.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Your name <span className="text-primary">*</span></label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Jane Smith"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Your email <span className="text-primary">*</span></label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Your app URL <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <input
                    name="appUrl"
                    value={form.appUrl}
                    onChange={handleChange}
                    placeholder="https://yourapp.base44.app"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Anything I should know upfront? <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the issue, what you've tried, or any context that will help..."
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground resize-none"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" size="lg" className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground" disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</> : <>Submit & Continue <ArrowRight className="w-4 h-4 ml-1" /></>}
                </Button>
              </form>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="mb-6">
                <UserPlus className="w-10 h-10 text-primary mb-3" />
                <h1 className="font-sora font-bold text-2xl mb-1">Add Will as a collaborator</h1>
                <p className="text-muted-foreground text-sm">To get started, Will needs collaborator access to your Base44 app. Here's how to add him in under 30 seconds.</p>
              </div>

              {/* Email to add */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Add this email</p>
                  <p className="font-sora font-bold text-foreground">{WILL_EMAIL}</p>
                </div>
                <Button size="sm" variant="outline" onClick={copyEmail} className="shrink-0">
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-400" />Copied!</> : "Copy"}
                </Button>
              </div>

              {/* Step-by-step instructions */}
              <div className="space-y-3 mb-6">
                <p className="text-sm font-semibold text-foreground">How to add a collaborator in Base44:</p>

                {[
                  {
                    num: "1",
                    text: "In your Base44 app, look at the top-right corner of the editor toolbar.",
                    highlight: null,
                  },
                  {
                    num: "2",
                    text: 'Click the "+" button (next to your profile avatar in the toolbar).',
                    highlight: "Look for the + icon shown below:",
                    hasImage: true,
                  },
                  {
                    num: "3",
                    text: `Type Will's email address and send the invite.`,
                    highlight: `Email: ${WILL_EMAIL}`,
                  },
                  {
                    num: "4",
                    text: "Will will accept the invite and get started on your service.",
                    highlight: null,
                  },
                ].map((s) => (
                  <div key={s.num} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{s.num}</div>
                    <div>
                      <p className="text-sm text-muted-foreground">{s.text}</p>
                      {s.highlight && <p className="text-xs font-semibold text-primary mt-0.5">{s.highlight}</p>}
                      {s.hasImage && (
                        <div className="mt-2 rounded-lg border border-border bg-[#1a2035] p-3 inline-flex items-center gap-2">
                          {/* Simulated toolbar */}
                          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                            <span className="text-xs font-bold text-muted-foreground">W</span>
                          </div>
                          <div className="w-7 h-7 rounded-full border-2 border-dashed border-primary/60 flex items-center justify-center cursor-pointer">
                            <Plus className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center">
                            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <div className="ml-1 flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">←</span>
                            <span className="text-xs text-primary font-semibold">Click the + here</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-4 mb-6">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">What happens next:</strong> Once Will has access, he'll review your app details and reach out within 24 hours to confirm the plan and schedule a time if needed.
                </p>
              </div>

              <Button
                size="lg"
                className="w-full font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => { trackEvent("service_onboarding_complete", { serviceId }); navigate("/dashboard"); }}
              >
                Done — Go to dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}