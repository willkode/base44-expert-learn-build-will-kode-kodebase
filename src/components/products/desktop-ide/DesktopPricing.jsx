import React from "react";
import { Check, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRICING, DOWNLOAD_URL } from "@/components/products/desktop-ide/desktopIdeData";
import { trackEvent } from "@/lib/analytics";
import DesktopProCheckoutButton from "@/components/products/desktop-ide/DesktopProCheckoutButton";

export default function DesktopPricing({ onEarlyAccess }) {
  const handleCta = (tier) => {
    trackEvent("desktop_ide_pricing_cta", { tier: tier.name, price: tier.price });
    if (!tier.highlight && DOWNLOAD_URL) {
      window.open(DOWNLOAD_URL, "_blank");
      return;
    }
    onEarlyAccess();
  };

  return (
    <section id="pricing" className="py-16 md:py-24 px-6 blueprint-grid">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Simple, Honest Pricing</p>
          <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mb-4">
            One payment. <span className="text-gradient-orange">Lifetime access.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Base44 Desktop releases August 1, 2026. Lock in the full desktop IDE plus every prompt,
            audit, agent test, and skill for a one-time $15 — before launch pricing becomes $25/month.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 max-w-xl mx-auto">
          {PRICING.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 flex flex-col ${
                tier.highlight ? "border-primary/50 bg-card glow-orange" : "border-border bg-card/60"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {tier.highlight ? <Sparkles className="w-5 h-5 text-primary" /> : <Download className="w-5 h-5 text-muted-foreground" />}
                <h3 className="font-sora font-semibold text-lg">{tier.name}</h3>
                {tier.badge && (
                  <span className="ml-auto text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e]">
                    {tier.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-5">{tier.tagline}</p>
              <div className="mb-1 flex items-baseline gap-2">
                <span className="font-sora font-bold text-4xl">{tier.price}</span>
                {tier.compareAt && (
                  <span className="text-lg text-muted-foreground line-through">{tier.compareAt}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-6">{tier.priceNote}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {tier.highlight ? (
                <DesktopProCheckoutButton
                  label={tier.cta}
                  className="w-full font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
                />
              ) : (
                <Button size="lg" onClick={() => handleCta(tier)} variant="outline" className="w-full font-semibold">
                  {tier.cta}
                </Button>
              )}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-6">
          Pre-launch special: pay $15 once and keep Pro access for life. When Base44 Desktop releases
          on August 1, 2026, Pro Access becomes $25/month — lifetime buyers keep everything, forever.
        </p>
      </div>
    </section>
  );
}