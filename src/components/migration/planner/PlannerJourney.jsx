import PlannerSection from "./PlannerSection";
import { journeySteps } from "./plannerData";

export default function PlannerJourney() {
  return (
    <PlannerSection eyebrow="How it works" title="From Repository to Roadmap in Five Steps">
      <div className="space-y-4 max-w-4xl mx-auto">
        {journeySteps.map((step, i) => (
          <div key={step.title} className="rounded-2xl border border-border bg-card/60 p-6 md:flex gap-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-sora font-bold text-lg mb-4 md:mb-0">
              {i + 1}
            </div>
            <div>
              <h3 className="font-sora font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
              {step.items && (
                <ul className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5">
                  {step.items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </PlannerSection>
  );
}