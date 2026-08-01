import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { pillars } from "@/components/services/growth/growthData";

export default function GrowthPillars() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {pillars.map((p, i) => (
        <motion.div
          key={p.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
          className="rounded-2xl border border-border bg-card/60 overflow-hidden flex flex-col"
        >
          <div className="flex items-start gap-4 p-6">
            <img src={p.image} alt="" loading="lazy" className="w-16 h-16 rounded-xl object-cover shrink-0" />
            <div>
              <h3 className="font-sora font-bold text-lg mb-1.5">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          </div>
          <div className="px-6 pb-6 mt-auto grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {p.items.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-foreground/90">
                <Check className="w-3.5 h-3.5 text-primary mt-1 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}