import { motion } from "framer-motion";
import { Lock, FileSearch } from "lucide-react";
import PlannerSection from "./PlannerSection";
import { previewItems } from "./plannerData";

export default function PlannerFreePreview() {
  return (
    <PlannerSection eyebrow="Free preview" title="What Your Free Preview Includes" intro="Your free assessment preview shows:">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="relative max-w-3xl mx-auto overflow-hidden rounded-[1.5rem] border border-border bg-card/60"
      >
        {/* Faux report header */}
        <div className="flex items-center gap-3 border-b border-border/70 bg-background/50 px-6 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileSearch className="w-4 h-4" /></span>
          <div className="flex-1">
            <p className="font-sora font-semibold text-sm">Migration Readiness Preview</p>
            <p className="text-xs text-muted-foreground">Included with your free account</p>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">Free</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 p-6 md:p-8">
          {previewItems.map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-foreground/80">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-red-400 to-amber-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        {/* Locked footer */}
        <div className="flex items-center justify-center gap-2 border-t border-border/70 bg-background/50 px-6 py-4 text-sm text-muted-foreground">
          <Lock className="w-4 h-4 text-primary" /> Your full technical roadmap remains locked until you purchase the report.
        </div>
      </motion.div>
    </PlannerSection>
  );
}