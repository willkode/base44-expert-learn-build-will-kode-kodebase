import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import SectionHeading from "@/components/learn/superagent/SectionHeading";
import { CAPABILITIES } from "@/components/learn/superagent/data";

export default function Capabilities() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeading label="Capabilities" title="What the Agent Can Do" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CAPABILITIES.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            className="rounded-2xl border border-border bg-card/70 p-5 hover:border-primary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4">
              <c.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-sora font-bold text-base mb-3">{c.title}</h3>
            <ul className="space-y-2">
              {c.items.map((it) => (
                <li key={it} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}