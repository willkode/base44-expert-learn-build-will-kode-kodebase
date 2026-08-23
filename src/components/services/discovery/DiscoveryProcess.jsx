import React from "react";
import { motion } from "framer-motion";
import { steps } from "@/components/services/discovery/discoveryAuditData";

export default function DiscoveryProcess() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 blueprint-grid opacity-10" />
      <div className="relative max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">How it works</p>
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">
            From booking to fixed.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card/60"
            >
              <span className="font-sora font-extrabold text-2xl text-gradient-orange shrink-0">{step.num}</span>
              <div>
                <p className="font-semibold text-foreground">{step.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}