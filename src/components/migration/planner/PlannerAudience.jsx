import { motion } from "framer-motion";
import PlannerSection from "./PlannerSection";
import ChipGrid from "./ChipGrid";
import { useCases } from "./plannerData";

export default function PlannerAudience() {
  return (
    <PlannerSection
      eyebrow="Any application"
      title="Built for Real Base44 Applications"
      intro="The planner can evaluate applications containing:"
    >
      <ChipGrid items={useCases} />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-center max-w-2xl mx-auto mt-10 space-y-2 text-sm md:text-base text-muted-foreground"
      >
        <p>Simple applications may be straightforward to migrate.</p>
        <p>
          Applications with complex payments, large datasets, realtime systems, AI agents, multiple integrations,
          or advanced permissions may require manual review.
        </p>
      </motion.div>
    </PlannerSection>
  );
}