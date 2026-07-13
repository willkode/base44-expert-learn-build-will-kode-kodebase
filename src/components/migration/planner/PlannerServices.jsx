import { CheckCircle2 } from "lucide-react";
import PlannerSection from "./PlannerSection";
import PlannerCTA from "./PlannerCTA";
import { serviceItems, postReportActions } from "./plannerData";

export default function PlannerServices() {
  return (
    <PlannerSection
      eyebrow="Done-for-you"
      title="Professional Migration Services"
      intro="Need help completing the migration? We can move your Base44 application to independent infrastructure that you control. Migration services may include:"
    >
      <div className="rounded-2xl border border-border bg-card/60 p-6 max-w-4xl mx-auto">
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 mb-6">
          {serviceItems.map((item) => (
            <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />{item}
            </li>
          ))}
        </ul>
        <p className="font-semibold mb-4">Professional migrations start at $2,000.</p>
        <p className="text-sm text-muted-foreground mb-2">After your report is generated, you can:</p>
        <ul className="flex flex-wrap gap-2 mb-6">
          {postReportActions.map((a) => (
            <li key={a} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{a}</li>
          ))}
        </ul>
        <PlannerCTA label="Start Your Assessment" location="services" />
      </div>
    </PlannerSection>
  );
}