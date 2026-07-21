import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { CheckCircle, Mail, UserPlus, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export default function ServiceThankYou() {
  const urlParams = new URLSearchParams(window.location.search);
  const service = urlParams.get("service") || "";
  const isEr = service.startsWith("er_");

  useEffect(() => {
    trackEvent("service_purchase_complete", { service: service || "unknown" });
  }, [service]);

  const steps = [
    { icon: Mail, title: "Check your email", desc: "Your Square receipt confirms the order. Keep an eye on your inbox — that's where your report will arrive." },
    ...(isEr
      ? [{
          icon: UserPlus,
          title: "Add me as a collaborator",
          desc: (
            <>
              In your Base44 dashboard, open your app → <span className="text-foreground font-medium">Users</span> → invite{" "}
              <span className="text-primary font-semibold">iamwillkode@gmail.com</span> as a collaborator so I can scan your app.
            </>
          ),
        }]
      : []),
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
          <div className="space-y-4 mb-10">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className={`flex items-start gap-4 p-5 rounded-xl border bg-card/60 ${i === 1 && isEr ? "border-primary/50 glow-orange" : "border-border"}`}>
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