import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { CheckCircle, Mail, UserPlus, FileText, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export default function ServiceThankYou() {
  const urlParams = new URLSearchParams(window.location.search);
  const service = urlParams.get("service") || "";

  useEffect(() => {
    trackEvent("service_purchase_complete", { service: service || "unknown" });
  }, [service]);

  const steps = [
    { icon: Mail, title: "Check your email", desc: "Your Square receipt confirms the order. Keep an eye on your inbox — that's where your report will arrive." },
    { icon: FileText, title: "Get your report", desc: "Findings grouped by priority with copy-paste fix prompts, delivered within 24–48 hours." },
  ];

  return (
    <>
      <Seo title="Order Confirmed | KodeBase" description="Your service order is confirmed." path="/services/thank-you" noindex />
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="relative max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight mb-3">
              Payment received. <span className="text-gradient-orange">You're all set.</span>
            </h1>
            <p className="text-muted-foreground text-lg">Here's what happens next:</p>
          </div>
          <div className="mb-8 p-6 rounded-xl border-2 border-red-500 bg-red-500/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="font-sora font-bold text-lg text-red-400 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Action required: add me to your app
                </p>
                <p className="text-sm text-foreground/90 mt-2 leading-relaxed">
                  In your Base44 dashboard, open your app → <span className="font-semibold">Users</span> → invite{" "}
                  <span className="font-bold text-red-300">iamwillkode@gmail.com</span> as a collaborator and set the role to{" "}
                  <span className="font-bold text-red-300">Guest</span> so I can scan your app.
                </p>
                <p className="text-xs text-muted-foreground mt-2">Your work can't start until this step is done.</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 mb-10">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card/60">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{i + 1}. {title}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Questions? Reach out anytime.</p>
            <Link to="/contact">
              <Button variant="outline">Contact me <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}