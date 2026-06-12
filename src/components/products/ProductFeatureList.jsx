import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function ProductFeatureList({ features = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
      {features.map((f, i) => (
        <motion.div
          key={f}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4"
        >
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium pt-1">{f}</span>
        </motion.div>
      ))}
    </div>
  );
}