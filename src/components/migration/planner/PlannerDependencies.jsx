import PlannerSection from "./PlannerSection";
import ChipGrid from "./ChipGrid";
import { baasDependencies } from "./plannerData";

export default function PlannerDependencies() {
  return (
    <PlannerSection
      title="Know Exactly What It Will Take to Leave Base44"
      intro="Exporting your Base44 app to GitHub is only the first step. Your application may still depend on Base44 for:"
    >
      <ChipGrid items={baasDependencies} />
      <div className="text-center max-w-2xl mx-auto mt-8 space-y-2">
        <p className="text-muted-foreground">
          The Base44 Migration Planner scans your repository, identifies these dependencies, and creates a complete migration roadmap based on your actual application.
        </p>
        <p className="font-semibold">No generic checklist. No guesswork. No one-size-fits-all estimate.</p>
      </div>
    </PlannerSection>
  );
}