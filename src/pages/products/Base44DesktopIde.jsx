import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { trackEvent } from "@/lib/analytics";
import { OG_IMAGE, FAQS } from "@/components/products/desktop-ide/desktopIdeData";
import DesktopHero from "@/components/products/desktop-ide/DesktopHero";
import DesktopProblem from "@/components/products/desktop-ide/DesktopProblem";
import DesktopBenefits from "@/components/products/desktop-ide/DesktopBenefits";
import DesktopFeatures from "@/components/products/desktop-ide/DesktopFeatures";
import DesktopHowItWorks from "@/components/products/desktop-ide/DesktopHowItWorks";
import DesktopUseCases from "@/components/products/desktop-ide/DesktopUseCases";
import DesktopWhy from "@/components/products/desktop-ide/DesktopWhy";
import DesktopComparison from "@/components/products/desktop-ide/DesktopComparison";
import DesktopOutcome from "@/components/products/desktop-ide/DesktopOutcome";
import DesktopPricing from "@/components/products/desktop-ide/DesktopPricing";
import DesktopEarlyAccess from "@/components/products/desktop-ide/DesktopEarlyAccess";
import DesktopFAQ from "@/components/products/desktop-ide/DesktopFAQ";
import DesktopFinalCTA from "@/components/products/desktop-ide/DesktopFinalCTA";

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function Base44DesktopIde() {
  useEffect(() => {
    trackEvent("page_view_desktop_ide", { page: "/products/base44-desktop-ide" });
  }, []);

  return (
    <div className="pt-16">
      <Seo
        title="Base44 Desktop — The Desktop IDE for Base44 Developers"
        description="Manage Base44 projects, prompts, backend resources, integrations, audits, agent user testing, logs, and deployments from one powerful desktop application."
        path="/products/base44-desktop-ide"
        type="website"
        image={OG_IMAGE}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Base44 Desktop IDE",
            operatingSystem: "Windows, macOS",
            applicationCategory: "DeveloperApplication",
            description: "An independent desktop development and operations workspace for Base44 developers, agencies, teams, and application owners.",
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
      <DesktopProblem />
      <DesktopBenefits />
      <DesktopFeatures />
      <DesktopHowItWorks />
      <DesktopUseCases />
      <DesktopWhy />
      <DesktopComparison />
      <DesktopOutcome />
      <DesktopPricing onEarlyAccess={() => scrollTo("early-access")} />
      <DesktopEarlyAccess />
      <DesktopFAQ />
      <DesktopFinalCTA onEarlyAccess={() => scrollTo("early-access")} />
    </div>
  );
}