import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Building2 } from "lucide-react";

export default function ModelCard({ model, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`relative flex flex-col rounded-2xl border bg-card/70 p-6 transition-colors ${
        model.featured ? "border-primary/50 glow-orange" : "border-border hover:border-primary/30"
      }`}
    >
      {model.tag && (
        <span className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
          {model.tag}
        </span>
      )}
      <div className="mb-3">
        <h3 className="font-sora font-bold text-2xl text-gradient-orange">{model.name}</h3>
        <p className="text-sm font-medium text-muted-foreground mt-1">{model.bestAt}</p>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm mb-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          Use it for
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{model.useFor}</p>
      </div>

      <div className="mt-auto pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm mb-1.5">
          <Building2 className="w-4 h-4 text-primary" />
          Vendor positioning
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{model.vendor}</p>
      </div>
    </motion.div>
  );
}