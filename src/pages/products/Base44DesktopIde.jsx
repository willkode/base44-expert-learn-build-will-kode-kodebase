import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { trackEvent } from "@/lib/analytics";
import { OG_IMAGE, FAQS } from "@/components/products/desktop-ide/desktopIdeData";
import DesktopHero from "@/components/products/desktop-ide/DesktopHero";
import DesktopIdea from "@/components/products/desktop-ide/DesktopIdea";
import DesktopModes from "@/components/products/desktop-ide/DesktopModes";
import DesktopDiscovery from "@/components/products/desktop-ide/DesktopDiscovery";
import DesktopWorkspaceTabs from "@/components/products/desktop-ide/DesktopWorkspaceTabs";
import DesktopAudits from "@/components/products/desktop-ide/DesktopAudits";
import DesktopPromptLibrary from "@/components/products/desktop-ide/DesktopPromptLibrary";
import DesktopMigration from "@/components/products/desktop-ide/DesktopMigration";
import DesktopProof from "@/components/products/desktop-ide/DesktopProof";
import DesktopCraft from "@/components/products/desktop-ide/DesktopCraft";
import DesktopSecurity from "@/components/products/desktop-ide/DesktopSecurity";
import DesktopSpecs from "@/components/products/desktop-ide/DesktopSpecs";
import DesktopLimits from "@/components/products/desktop-ide/DesktopLimits";
import DesktopPricing from "@/components/products/desktop-ide/DesktopPricing";
import DesktopEarlyAccess from "@/components/products/desktop-ide/DesktopEarlyAccess";
import DesktopFAQ from "@/components/products/desktop-ide/DesktopFAQ";
import DesktopFinalCTA from "@/components/products/desktop-ide/DesktopFinalCTA";

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function Base44DesktopIde() {
  useEffect(() => {
    trackEvent("page_view_desktop_ide", { page: "/tools/base44-desktop-ide" });
  }, []);

  return (
    <div className="pt-16">
      <Seo
        title="Base44 Desktop IDE — Open, Audit & Migrate Your Base44 Apps on Windows"
        description="Base44 Desktop IDE: a Windows workbench for your Base44 account — open any app in the real editor, read the code locally, run 10 AI audits, and lift the frontend to your own hosting. $25 lifetime."
        path="/tools/base44-desktop-ide"
        type="website"
        image={OG_IMAGE}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Base44 Desktop IDE",
            operatingSystem: "Windows 10, Windows 11",
            applicationCategory: "DeveloperApplication",
            description: "Base44 Desktop IDE — a Windows desktop workbench for Base44 builders: embedded editor, local source viewer, preview server, backend logs, ten AI audits, and an optional frontend migration flow.",
            offers: { "@type": "Offer", price: "25.00", priceCurrency: "USD" },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <DesktopHero onEarlyAccess={() => scrollTo("pricing")} onExplore={() => scrollTo("features")} />
      <DesktopIdea />
      <DesktopModes />
      <DesktopDiscovery />
      <DesktopWorkspaceTabs />
      <DesktopAudits />
      <DesktopPromptLibrary />
      <DesktopMigration />
      <DesktopProof />
      <DesktopCraft />
      <DesktopSecurity />
      <DesktopSpecs />
      <DesktopLimits />
      <DesktopPricing onEarlyAccess={() => scrollTo("early-access")} />
      <DesktopEarlyAccess />
      <DesktopFAQ />
      <DesktopFinalCTA onEarlyAccess={() => scrollTo("early-access")} />
    </div>
  );
}