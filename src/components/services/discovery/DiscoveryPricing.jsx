import React from "react";
import { CheckCircle } from "lucide-react";
import ServiceCheckoutButton from "@/components/services/ServiceCheckoutButton";
import { DISCOVERY_PRICE, included } from "@/components/services/discovery/discoveryAuditData";

export default function DiscoveryPricing({ onCta }) {
  return (
    <section id="pricing" className="py-20 scroll-mt-24">
      <div className="max-w-xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Pricing</p>
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">
            One flat price. Everything included.
          </h2>
          <p className="text-muted-foreground">
            No retainer, no hourly billing, no surprise scope.
          </p>
        </div>
        <div className="rounded-2xl border border-primary bg-primary/5 glow-orange p-8">
          <h3 className="font-sora font-bold text-xl mb-1">Discovery Audit</h3>
          <p className="text-sm text-muted-foreground mb-5">Full app review + major fixes + fix prompts</p>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="font-sora font-extrabold text-4xl text-foreground">${DISCOVERY_PRICE}</span>
            <span className="text-muted-foreground text-sm">one-time</span>
          </div>
          <ul className="space-y-2.5 mb-8">
            {included.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <ServiceCheckoutButton
            serviceId="discovery_audit"
            redirectPath="/services/discovery-audit/next"
            label={`Book My Discovery Audit — $${DISCOVERY_PRICE}`}
            onClick={onCta}
          />
        </div>
      </div>
    </section>
  );
}