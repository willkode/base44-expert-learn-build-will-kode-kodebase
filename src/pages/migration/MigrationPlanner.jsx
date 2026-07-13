import { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { faqSchema } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import MigrationDisclaimer from "@/components/migration/MigrationDisclaimer";
import PlannerFAQ, { plannerFaqs } from "@/components/migration/PlannerFAQ";
import PlannerHero from "@/components/migration/planner/PlannerHero";
import MigrationSaleBanner from "@/components/migration/MigrationSaleBanner";
import PlannerDependencies from "@/components/migration/planner/PlannerDependencies";
import PlannerJourney from "@/components/migration/planner/PlannerJourney";
import PlannerFreePreview from "@/components/migration/planner/PlannerFreePreview";
import PlannerReportContents from "@/components/migration/planner/PlannerReportContents";
import PlannerDeterministic from "@/components/migration/planner/PlannerDeterministic";
import PlannerServices from "@/components/migration/planner/PlannerServices";
import PlannerAudience from "@/components/migration/planner/PlannerAudience";
import PlannerWhy from "@/components/migration/planner/PlannerWhy";
import PlannerTrust from "@/components/migration/planner/PlannerTrust";
import PlannerFinalCTA from "@/components/migration/planner/PlannerFinalCTA";

const OG = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/559f2782f_generated_image.png";

export default function MigrationPlanner() {
  useEffect(() => trackEvent("migration_planner_view"), []);
  return (
    <div className="max-w-6xl mx-auto space-y-24 md:space-y-32 px-4 sm:px-6 pt-6 md:pt-10 pb-20">
      <Seo
        title="Plan Your Base44 Migration Before You Spend Thousands | KodeBase"
        description="Scan your Base44 GitHub repository, get a free readiness preview, and unlock a complete migration roadmap, security review, and professional quote for $12.50 — 50% off for a limited time."
        path="/migration-planner"
        image={OG}
        jsonLd={[faqSchema(plannerFaqs.map((f) => ({ q: f.question, a: f.answer })))]}
      />
      <div className="!mt-0"><MigrationSaleBanner /></div>
      <PlannerHero />
      <PlannerDependencies />
      <PlannerJourney />
      <PlannerFreePreview />
      <PlannerReportContents />
      <PlannerDeterministic />
      <PlannerServices />
      <PlannerAudience />
      <PlannerWhy />
      <PlannerTrust />
      <section className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4">Answers</span>
          <h2 className="font-sora text-3xl md:text-[2.6rem] md:leading-[1.15] font-bold tracking-tight">Frequently Asked Questions</h2>
        </div>
        <PlannerFAQ />
      </section>
      <PlannerFinalCTA />
      <MigrationDisclaimer />
    </div>
  );
}