import { motion } from "framer-motion";
import PlannerSection from "./PlannerSection";
import ChipGrid from "./ChipGrid";
import { baasDependencies } from "./plannerData";

export default function PlannerDependencies() {
  return (
    <PlannerSection
      eyebrow="Hidden dependencies"
      title="Know Exactly What It Will Take to Leave Base44"
      intro="Exporting your Base44 app to GitHub is only the first step. Your application may still depend on Base44 for:"
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
          The Base44 Migration Planner scans your repository, identifies these dependencies, and creates a complete migration roadmap based on your actual application.
        </p>
        <p className="font-sora font-semibold text-lg">
          No generic checklist. No guesswork. <span className="text-gradient-orange">No one-size-fits-all estimate.</span>
        </p>
      </motion.div>
    </PlannerSection>
  );
}