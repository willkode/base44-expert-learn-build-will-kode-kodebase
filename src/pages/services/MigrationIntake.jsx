import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { CheckCircle } from "lucide-react";
import MigrationIntakeForm from "@/components/services/migration/MigrationIntakeForm";
import { trackEvent } from "@/lib/analytics";

// Landing page after a paid Base44 Migration checkout — collects intake details.
export default function MigrationIntake() {
  useEffect(() => {
    trackEvent("service_purchase_complete", { service: "base44_migration" });
  }, []);

  return (
    <>
      <Seo
        title="Migration Payment Confirmed — Tell Me About Your App | KodeBase"
        description="Your Base44 migration payment is confirmed. Share your app details so we can get started."
        path="/services/migration-intake"
        noindex
      />
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="relative max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight mb-3">
              Payment received. <span className="text-gradient-orange">One last step.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Fill out the form below with your app details so I can contact you and kick off your migration within 24 hours.
            </p>
          </div>
          <MigrationIntakeForm />
        </div>
      </section>
    </>
  );
}