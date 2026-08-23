import React from "react";
import { motion } from "framer-motion";
import { auditAreas } from "@/components/services/discovery/discoveryAuditData";

export default function DiscoveryAreas() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 blueprint-grid opacity-10" />
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What I review</p>
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">
            The whole app. Not one slice of it.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Six areas, reviewed together — because most real problems live where they overlap.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {auditAreas.map((area, i) => (
            <motion.div
              key={area.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card/60 p-6"
            >
              <span className="font-sora font-extrabold text-2xl text-gradient-orange">{area.num}</span>
              <h3 className="font-sora font-bold text-lg mt-2 mb-2">{area.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{area.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}