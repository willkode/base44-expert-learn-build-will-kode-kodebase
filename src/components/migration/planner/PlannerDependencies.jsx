import { motion } from "framer-motion";
import PlannerSection from "./PlannerSection";
import ChipGrid from "./ChipGrid";
import { baasDependencies } from "./plannerData";

export default function PlannerDependencies() {
  return (
    <PlannerSection
      eyebrow="Hidden dependencies"
      title="Your Exported Code Isn't as Independent as It Looks"
      intro="Exporting to GitHub feels like freedom — but your app may still call home to Base44 for:"
    >
      <ChipGrid items={baasDependencies} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative max-w-2xl mx-auto mt-10 rounded-2xl border border-border bg-card/60 p-6 md:p-8 text-center overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <p className="text-muted-foreground leading-relaxed mb-3">
          Miss one and your "finished" migration breaks in production. The planner scans your actual repository, exposes every dependency, and builds your roadmap from real code.
        </p>
        <p className="font-sora font-semibold text-lg">
          No generic checklist. No guesswork. <span className="text-gradient-orange">No one-size-fits-all estimate.</span>
        </p>
      </motion.div>
    </PlannerSection>
  );
}