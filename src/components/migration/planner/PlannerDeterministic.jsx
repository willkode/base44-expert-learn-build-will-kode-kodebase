import PlannerSection from "./PlannerSection";
import ChipGrid from "./ChipGrid";
import { deterministicItems } from "./plannerData";

export default function PlannerDeterministic() {
  return (
    <PlannerSection
      title="More Than a Static AI Report"
      intro="The Migration Planner does not rely only on AI-generated assumptions. It first performs deterministic repository analysis to identify actual:"
    >
      <ChipGrid items={deterministicItems} />
      <p className="text-center max-w-2xl mx-auto mt-8 text-muted-foreground">
        AI is then used to organize, explain, and prioritize the findings. This makes the final report more accurate,
        traceable, and useful than a generic AI-generated migration checklist.
      </p>
    </PlannerSection>
  );
}