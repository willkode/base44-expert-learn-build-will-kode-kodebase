import { motion } from "framer-motion";
import { ScanSearch, Sparkles } from "lucide-react";
import PlannerSection from "./PlannerSection";
import { deterministicItems } from "./plannerData";

export default function PlannerDeterministic() {
  return (
    <PlannerSection
      eyebrow="Real analysis"
      title="Real Code Analysis First. AI Explains — It Doesn't Guess."
      intro="Anyone can paste a repo into a chatbot and get a confident-sounding checklist. This isn't that."
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
          <p className="text-sm text-muted-foreground mb-4">The planner reads your actual code before any AI touches it, identifying real:</p>
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
            AI is only used to organize, explain, and prioritize verified findings. That's why every section of your report is traceable to your code — not hallucinated around it.
          </p>
        </motion.div>
      </div>
    </PlannerSection>
  );
}