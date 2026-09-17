import React, { useState } from "react";
import { CheckCircle, ShieldCheck, Smartphone } from "lucide-react";
import ServiceCheckoutButton from "@/components/services/ServiceCheckoutButton";

export const MIGRATION_PRICE = 199;
export const MOBILE_ADDON_PRICE = 99;

const includes = [
  "Backend, database, auth, storage and integrations moved to infrastructure you own",
  "Your existing frontend preserved wherever possible",
  "Deployment set up on your own hosting",
  "Handover docs so your team can run it",
];

export default function MigrationCheckout() {
  const [mobile, setMobile] = useState(false);
  const total = MIGRATION_PRICE + (mobile ? MOBILE_ADDON_PRICE : 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <div className="text-center mb-6">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">One flat price</p>
        <p className="font-sora font-extrabold text-4xl tracking-tight">
          <span className="text-gradient-orange">${total}</span>
          <span className="text-muted-foreground line-through text-xl ml-3">$2,000</span>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Any size app — no quotes, no proposal cycle, no surprise pricing.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {includes.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>

      {/* Mobile app conversion upsell — not part of the base migration */}
      <label className="block mb-6 cursor-pointer rounded-xl border border-primary/30 bg-primary/5 p-4 hover:border-primary/50 transition-colors">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={mobile}
            onChange={(e) => setMobile(e.target.checked)}
            className="mt-1 h-4 w-4 accent-primary shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Smartphone className="w-4 h-4 text-primary" />
              <span className="font-sora font-semibold text-sm">Add mobile app conversion</span>
              <span className="text-xs font-semibold text-primary">+${MOBILE_ADDON_PRICE}</span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Turning your Base44 app into an installable iOS / Android app is <strong>not included</strong> in the
              migration. Add it here and I'll set up the native mobile build alongside your migration.
            </p>
          </div>
        </div>
      </label>

      <ServiceCheckoutButton
        key={mobile ? "mobile" : "base"}
        serviceId={mobile ? "base44_migration_mobile" : "base44_migration"}
        label={`Start My Migration — $${total}`}
        redirectPath="/services/base44-migration/next"
      />

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        Secure checkout. After payment you'll send your app details and add me as a collaborator.
      </p>
    </div>
  );
}