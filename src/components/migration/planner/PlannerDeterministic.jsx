import { motion } from "framer-motion";
import { ScanSearch, Sparkles } from "lucide-react";
import PlannerSection from "./PlannerSection";
import { deterministicItems } from "./plannerData";

export default function PlannerDeterministic() {
  return (
    <PlannerSection
      eyebrow="Real analysis"
      title="More Than a Static AI Report"
      intro="The Migration Planner does not rely only on AI-generated assumptions."
    >
      <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-card/60 p-6 md:p-8"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5"><ScanSearch className="w-5 h-5" /></span>
          <h3 className="font-sora font-semibold text-lg mb-3">Deterministic repository analysis first</h3>
          <p className="text-sm text-muted-foreground mb-4">It first performs deterministic repository analysis to identify actual:</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {deterministicItems.map((item) => (
              <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-gradient-to-r from-red-400 to-amber-400 shrink-0" />{item}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-primary/25 bg-primary/5 p-6 md:p-8 flex flex-col justify-center"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5"><Sparkles className="w-5 h-5" /></span>
          <h3 className="font-sora font-semibold text-lg mb-3">AI explains — it doesn't guess</h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            AI is then used to organize, explain, and prioritize the findings. This makes the final report more accurate, traceable, and useful than a generic AI-generated migration checklist.
          </p>
        </motion.div>
      </div>
    </PlannerSection>
  );
}