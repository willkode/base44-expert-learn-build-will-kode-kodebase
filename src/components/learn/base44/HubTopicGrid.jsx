import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CATEGORY_ORDER } from "./base44HubData";

export default function HubTopicGrid({ sections, onSelect }) {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: sections.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-10">
      {grouped.map(({ cat, items }, gi) => (
        <div key={cat}>
          <h2 className="font-sora font-bold text-xl mb-4">
            <span className="text-gradient-orange">{cat}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((s, i) => (
              <motion.button
                key={s.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                onClick={() => onSelect(s)}
                className="group text-left rounded-xl border border-border bg-card/60 hover:border-primary/40 hover:bg-card p-4 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-sora font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {s.title}
                  </p>
                  <ArrowRight className="w-4 h-4 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                  {s.body.replace(/[#>*`|\-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 140)}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}