import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.05 } }),
};

// Highlight chips — same labels, styled to match Home's card language (blueprint grid + bordered tiles).
export default function ProHighlights({ highlights }) {
  return (
    <section className="relative py-14 scroll-mt-20">
      <div className="absolute inset-0 blueprint-grid opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {highlights.map(({ icon: Icon, label }, i) => (
            <motion.div
              key={label}
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 px-4 py-3.5 hover:border-primary/40 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-foreground/90 font-medium leading-snug">{label}</span>
              <CheckCircle2 className="w-4 h-4 text-primary/60 shrink-0 ml-auto" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}