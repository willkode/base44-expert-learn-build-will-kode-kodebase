import { motion } from "framer-motion";
import PlannerSection from "./PlannerSection";
import { whyItems } from "./plannerData";

export default function PlannerWhy() {
  return (
    <PlannerSection eyebrow="Why it matters" title="Why Use the Migration Planner?">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {whyItems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 md:p-7 transition-colors hover:border-primary/40"
          >
            <span className="font-sora text-4xl font-extrabold text-primary/15 group-hover:text-primary/30 transition-colors absolute top-4 right-5 select-none">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-sora font-semibold text-lg mb-3 pr-10">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </PlannerSection>
  );
}