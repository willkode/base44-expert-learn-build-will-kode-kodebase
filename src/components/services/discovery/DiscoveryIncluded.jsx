import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { included } from "@/components/services/discovery/discoveryAuditData";

export default function DiscoveryIncluded() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What you get</p>
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">
            A report, the fixes, and the prompts.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            You don't just find out what's wrong — the serious problems leave fixed.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {included.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/60"
            >
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}