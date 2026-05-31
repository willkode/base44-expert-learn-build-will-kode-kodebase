import React from "react";
import { motion } from "framer-motion";
import { Code2, Zap, Users, Award } from "lucide-react";

const stats = [
  { icon: Code2, value: "30+", label: "Years Building" },
  { icon: Zap, value: "500+", label: "Apps Shipped" },
  { icon: Users, value: "10k+", label: "Vibe Coders Helped" },
  { icon: Award, value: "Base44", label: "Certified Expert" },
];

export default function HeroStats() {
  return (
    <section className="relative bg-card/60 border-y border-border">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex items-center gap-4">

            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <s.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-sora font-bold text-2xl leading-none">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>);

}