import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import PlannerSection from "./PlannerSection";
import PlannerCTA from "./PlannerCTA";
import { serviceItems, postReportActions } from "./plannerData";

export default function PlannerServices() {
  return (
    <PlannerSection
      eyebrow="Done-for-you"
      title="Professional Migration Services"
      intro="Need help completing the migration? We can move your Base44 application to independent infrastructure that you control. Migration services may include:"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="relative max-w-4xl mx-auto overflow-hidden rounded-[1.5rem] border border-primary/25 bg-card/60 p-6 md:p-10"
      >
        <div className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-primary/15 blur-[80px]" />
        <ul className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5 mb-8">
          {serviceItems.map((item) => (
            <li key={item} className="text-sm text-foreground/80 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />{item}
            </li>
          ))}
        </ul>
        <p className="font-sora font-semibold text-lg mb-6">
          Professional migrations start at <span className="text-gradient-orange">$2,000</span>.
        </p>
        <p className="text-sm text-muted-foreground mb-3">After your report is generated, you can:</p>
        <ul className="flex flex-wrap gap-2 mb-8">
          {postReportActions.map((a) => (
            <li key={a} className="rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">{a}</li>
          ))}
        </ul>
        <PlannerCTA label="Start Your Assessment" location="services" />
      </motion.div>
    </PlannerSection>
  );
}