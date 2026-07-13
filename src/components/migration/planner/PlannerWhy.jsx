import PlannerSection from "./PlannerSection";
import { whyItems } from "./plannerData";

export default function PlannerWhy() {
  return (
    <PlannerSection title="Why Use the Migration Planner?">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {whyItems.map((item) => (
          <div key={item.title} className="rounded-2xl border border-border bg-card/60 p-6">
            <h3 className="font-sora font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </PlannerSection>
  );
}