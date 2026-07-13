import { motion } from "framer-motion";
import PlannerSection from "./PlannerSection";
import { reportSections } from "./plannerData";

export default function PlannerReportContents() {
  return (
    <PlannerSection eyebrow="$25 one-time unlock" title="A $25 Report That Prevents $10,000 Mistakes" intro="Fourteen sections of migration intelligence, built from your actual code:">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {reportSections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: (idx % 2) * 0.06 }}
            className="rounded-2xl border border-border bg-card/60 p-6 md:p-7 transition-colors hover:border-primary/40"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-sora text-xs font-bold text-primary">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <h3 className="font-sora font-semibold text-base md:text-lg">{section.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{section.intro}</p>
            {section.items && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 mb-3">
                {section.items.map((item, i) => (
                  <li key={item} className="text-sm text-muted-foreground flex items-start gap-2.5">
                    {section.ordered
                      ? <span className="text-primary font-sora font-semibold text-xs mt-0.5">{i + 1}.</span>
                      : <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-gradient-to-r from-red-400 to-amber-400 shrink-0" />}
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {section.outro && <p className="text-sm text-muted-foreground">{section.outro}</p>}
          </motion.div>
        ))}
      </div>
    </PlannerSection>
  );
}