import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/learn/superagent/SectionHeading";
import { USE_CASES } from "@/components/learn/superagent/data";

export default function UseCases() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeading label="Use Cases" title="What to Build" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {USE_CASES.map((u, i) => (
          <motion.div
            key={u.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.02 }}
            className="group rounded-2xl border border-border bg-card/70 p-6 hover:border-primary/30 transition-colors"
          >
            <h3 className="font-sora font-bold text-lg mb-2">{u.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{u.desc}</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Show examples
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}