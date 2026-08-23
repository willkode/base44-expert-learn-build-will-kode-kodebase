import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { faqSchema } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import ServiceFAQ from "@/components/services/ServiceFAQ";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import DiscoveryHero from "@/components/services/discovery/DiscoveryHero";
import DiscoveryAreas from "@/components/services/discovery/DiscoveryAreas";
import DiscoveryIncluded from "@/components/services/discovery/DiscoveryIncluded";
import DiscoveryProcess from "@/components/services/discovery/DiscoveryProcess";
import DiscoveryPricing from "@/components/services/discovery/DiscoveryPricing";
import { faqs, OG_IMAGE, DISCOVERY_PRICE } from "@/components/services/discovery/discoveryAuditData";

export default function DiscoveryAudit() {
  useEffect(() => {
    trackEvent("page_view", { page: "discovery_audit_service" });
  }, []);

  const handleCTA = (label) => () =>
    trackEvent("service_cta_click", { service: "discovery_audit", cta: label });

  return (
    <>
      <Seo
        title={`Discovery Audit — Find Everything Wrong With Your App | $${DISCOVERY_PRICE} | KodeBase`}
        description="A complete review of your entire app: security, code quality, functionality and UI/UX. Full issue report, all major security and functionality issues fixed at no extra cost, plus targeted fix prompts. $225 one-time."
        path="/services/discovery-audit"
        image={OG_IMAGE}
        jsonLd={[faqSchema(faqs)]}
      />
      <DiscoveryHero onCta={handleCTA("hero")} />
      <DiscoveryAreas />
      <DiscoveryIncluded />
      <DiscoveryPricing onCta={handleCTA("pricing")} />
      <DiscoveryProcess />
      <ReviewsSection seed="service:discovery-audit" title="What clients say about the Discovery Audit" />
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">FAQ</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">Frequently Asked Questions</h2>
          </div>
          <ServiceFAQ faqs={faqs} />
        </div>
      </section>
    </>
  );
}