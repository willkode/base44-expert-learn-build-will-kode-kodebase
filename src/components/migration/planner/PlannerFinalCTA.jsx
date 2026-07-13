import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import PlannerCTA from "./PlannerCTA";
import { finalCtaItems } from "./plannerData";

export default function PlannerFinalCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55 }}
      className="relative overflow-hidden rounded-[2rem] border border-primary/25 bg-card/50 blueprint-grid"
    >
      <div className="pointer-events-none absolute -top-28 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
      <div className="relative px-5 py-14 md:px-12 md:py-20 text-center max-w-3xl mx-auto">
        <h2 className="font-sora text-3xl md:text-[2.6rem] md:leading-[1.15] font-bold tracking-tight mb-4">
          <span className="text-gradient-orange">$25 Now</span> Beats a $10,000 Surprise Later
        </h2>
        <p className="text-muted-foreground mb-8">Start with your free readiness preview, then unlock everything:</p>
        <ul className="flex flex-wrap justify-center gap-2.5 mb-9">
          {finalCtaItems.map((item) => (
            <li key={item} className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-4 py-2 text-sm text-foreground/80 backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{item}
            </li>
          ))}
        </ul>
        <p className="font-sora font-semibold mb-7">One payment. $25. The whole plan.</p>
        <div className="flex justify-center mb-5"><PlannerCTA label="Start My Free Assessment" location="final_cta" /></div>
        <p className="text-sm text-muted-foreground">Professional Base44 migrations start at <span className="font-semibold text-foreground">$2,000</span>.</p>
      </div>
    </motion.section>
  );
}