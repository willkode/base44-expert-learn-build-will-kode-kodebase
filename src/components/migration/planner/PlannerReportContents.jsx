import PlannerSection from "./PlannerSection";
import { reportSections } from "./plannerData";

export default function PlannerReportContents() {
  return (
    <PlannerSection eyebrow="$25 one-time unlock" title="What You Get for $25" intro="Your complete migration report includes:">
      <div className="grid md:grid-cols-2 gap-4">
        {reportSections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-border bg-card/60 p-6">
            <h3 className="font-sora font-semibold text-lg mb-2">{section.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{section.intro}</p>
            {section.items && (
              <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {section.items.map((item, i) => (
                  <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                    {section.ordered
                      ? <span className="text-primary font-semibold text-xs mt-0.5">{i + 1}.</span>
                      : <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />}
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {section.outro && <p className="text-sm text-muted-foreground mt-3">{section.outro}</p>}
          </div>
        ))}
      </div>
    </PlannerSection>
  );
}