import React from "react";
import { motion } from "framer-motion";
import { Rocket, Code2, Users, Briefcase } from "lucide-react";

const AUDIENCE = [
  { icon: Rocket, title: "Founders", desc: "Validate your MVP with a Base44-ready plan — no fragile foundation, no wasted weeks." },
  { icon: Code2, title: "Developers", desc: "Standardize discovery and planning across every client project with consistent blueprints." },
  { icon: Users, title: "Product Teams", desc: "A repeatable process for AI-assisted development that's easy to review, delegate, and document." },
  { icon: Briefcase, title: "Operators", desc: "Deep domain knowledge translated into clear app requirements — no backend architecture degree needed." },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function KitAudience() {
  return (
    <div className="max-w-5xl mx-auto mt-24">
      <div className="text-center mb-10">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Who Benefits</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-4">
          Built for every type of <span className="text-gradient-orange">builder</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {AUDIENCE.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            transition={{ duration: 0.35, delay: i * 0.1 }}
            className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border border-border bg-card/60 hover:border-primary/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}