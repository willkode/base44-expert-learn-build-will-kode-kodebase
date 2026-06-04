import React from "react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { HERO_TAGS } from "@/components/learn/superagent/data";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-30" />
      <div className="relative max-w-4xl mx-auto px-6 pt-28 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-7 glow-orange">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Base44 AI Agent</p>
          <h1 className="font-sora font-extrabold text-4xl md:text-6xl tracking-tight mb-6">
            <span className="text-gradient-orange">Base44 AI Agent</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            A privileged, skill-driven automation operator with cross-app read access and
            single-app write control. Build powerful workflows with a dumb trigger and a smart handler.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 mt-9">
            {HERO_TAGS.map((t) => (
              <span key={t} className="rounded-full border border-border bg-card/70 px-4 py-1.5 text-sm text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}