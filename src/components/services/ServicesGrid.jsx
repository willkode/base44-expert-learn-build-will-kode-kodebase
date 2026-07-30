import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { trackCTA } from "@/lib/analytics";

export default function ServicesGrid({ items }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((s, i) => (
        <motion.div
          key={s.to}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
        >
          <Link
            to={s.to}
            onClick={() => trackCTA({ text: s.label, location: "services_index", destination: s.to })}
            className="group flex flex-col h-full rounded-xl border border-border bg-card/50 p-6 hover:border-primary/40 transition-colors"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary mb-4">
              <s.icon className="h-5 w-5" />
            </span>
            <span className="flex items-center gap-2 font-sora font-semibold text-lg text-foreground">
              {s.label}
              {s.badge && (
                <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">
                  {s.badge}
                </span>
              )}
            </span>
            <span className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</span>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Learn more
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}