import React from "react";
import { CheckCircle, ShieldCheck } from "lucide-react";
import ServiceCheckoutButton from "@/components/services/ServiceCheckoutButton";

export const MIGRATION_PRICE = 199;

const includes = [
  "Backend, database, auth, storage and integrations moved to infrastructure you own",
  "Your existing frontend preserved wherever possible",
  "Deployment set up on your own hosting",
  "Handover docs so your team can run it",
];

export default function MigrationCheckout() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <div className="text-center mb-6">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">One flat price</p>
        <p className="font-sora font-extrabold text-4xl tracking-tight">
          <span className="text-gradient-orange">${MIGRATION_PRICE}</span>
          <span className="text-muted-foreground line-through text-xl ml-3">$2,000</span>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Any size app — no quotes, no proposal cycle, no surprise pricing.
        </p>
      </div>

      <div className="space-y-3 mb-7">
        {includes.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>

      <ServiceCheckoutButton
        serviceId="base44_migration"
        label={`Start My Migration — $${MIGRATION_PRICE}`}
        redirectPath="/services/base44-migration/next"
      />

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        Secure checkout. After payment you'll send your app details and add me as a collaborator.
      </p>
    </div>
  );
}