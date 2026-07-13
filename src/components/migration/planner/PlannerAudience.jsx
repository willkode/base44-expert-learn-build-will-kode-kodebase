import PlannerSection from "./PlannerSection";
import ChipGrid from "./ChipGrid";
import { useCases } from "./plannerData";

export default function PlannerAudience() {
  return (
    <PlannerSection title="Built for Real Base44 Applications" intro="The planner can evaluate applications containing:">
      <ChipGrid items={useCases} />
      <div className="text-center max-w-2xl mx-auto mt-8 space-y-2 text-muted-foreground text-sm">
        <p>Simple applications may be straightforward to migrate.</p>
        <p>
          Applications with complex payments, large datasets, realtime systems, AI agents, multiple integrations,
          or advanced permissions may require manual review.
        </p>
      </div>
    </PlannerSection>
  );
}