import React from "react";
import { motion } from "framer-motion";

const platforms = ["Base44", "Supabase", "Firebase", "Bubble", "Lovable", "Bolt", "Replit", "Custom React"];

export default function Platforms() {
  return (
    <section className="py-20 relative border-y border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-sora font-bold text-2xl md:text-3xl tracking-tight mb-3">
            Built for your stack, not a generic template
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
            Pick your platform and Kode Architect tailors your entities, access rules, and prompts to it — so the plan actually works where you build.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {platforms.map((p, i) => (
            <motion.span
              key={p}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`px-5 py-2.5 rounded-full border font-sora font-semibold text-sm ${
                p === "Base44"
                  ? "border-primary/50 bg-primary/10 text-primary glow-orange"
                  : "border-border bg-secondary/50 text-muted-foreground"
              }`}
            >
              {p}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}