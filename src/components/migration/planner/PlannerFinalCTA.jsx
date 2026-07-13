import { CheckCircle2 } from "lucide-react";
import PlannerCTA from "./PlannerCTA";
import { finalCtaItems } from "./plannerData";

export default function PlannerFinalCTA() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card/60 px-6 py-14 text-center blueprint-grid">
      <div className="absolute inset-0 bg-primary/5" />
      <div className="relative max-w-3xl mx-auto">
        <h2 className="font-sora text-3xl md:text-4xl font-bold mb-4">Start With a $25 Migration Assessment</h2>
        <p className="text-muted-foreground mb-6">Understand your application before committing to a migration. Receive:</p>
        <ul className="flex flex-wrap justify-center gap-2 mb-7">
          {finalCtaItems.map((item) => (
            <li key={item} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />{item}
            </li>
          ))}
        </ul>
        <p className="font-semibold mb-6">Unlock the complete report for a one-time payment of $25.</p>
        <div className="flex justify-center mb-4"><PlannerCTA location="final_cta" /></div>
        <p className="text-sm text-muted-foreground">Professional Base44 migrations start at <span className="font-semibold text-foreground">$2,000</span>.</p>
      </div>
    </section>
  );
}