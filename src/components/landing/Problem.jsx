import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Layers, Lock, Copy, Workflow, EyeOff, Bug } from "lucide-react";

const problems = [
  { icon: Layers, text: "Messy entities & duplicated data" },
  { icon: Lock, text: "Weak permissions & exposed data" },
  { icon: Copy, text: "Duplicated, overlapping features" },
  { icon: Workflow, text: "Confusing, broken user flows" },
  { icon: EyeOff, text: "No real security model" },
  { icon: Bug, text: "Works in demo, breaks with real users" },
];

export default function Problem() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-destructive/30 bg-destructive/10 mb-6">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">The Problem</span>
          </div>
          <h2 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mb-5">
            Most apps are built wrong.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Anyone can prompt AI to build an app. But almost no one knows how to architect software
            correctly — and it shows the moment real users arrive.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-center gap-4 rounded-xl border border-border bg-card/60 p-5"
            >
              <div className="w-11 h-11 shrink-0 rounded-lg bg-destructive/10 flex items-center justify-center">
                <p.icon className="w-5 h-5 text-destructive" />
              </div>
              <span className="font-medium text-foreground">{p.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}