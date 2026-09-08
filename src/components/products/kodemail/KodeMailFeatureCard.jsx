import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function KodeMailFeatureCard({ feature, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.05 }}
      className="group relative rounded-2xl border border-border bg-card/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-black/30"
    >
      <div className="relative overflow-hidden">
        <img
          src={feature.image}
          alt={feature.label}
          loading="lazy"
          className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" aria-hidden="true" />
      </div>
      <div className="flex items-start gap-3 p-5">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Check className="w-3 h-3" />
        </span>
        <span className="text-sm leading-relaxed">{feature.label}</span>
      </div>
    </motion.div>
  );
}