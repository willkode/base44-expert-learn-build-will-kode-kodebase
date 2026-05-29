import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Layers, Lock, Copy, Workflow, EyeOff, Bug } from "lucide-react";

const problems = [
  { icon: Layers, text: "Tangled entities & duplicated data" },
  { icon: Lock, text: "Weak permissions that leak user data" },
  { icon: Copy, text: "Overlapping, half-built features" },
  { icon: Workflow, text: "Confusing flows that lose users" },
  { icon: EyeOff, text: "No real security model" },
  { icon: Bug, text: "Looks great in a demo — crashes with real traffic" },
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
            AI can build your app. It can't architect it.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Anyone can prompt their way to a working demo. But without a real architecture
            underneath, that app falls apart the moment it meets real users — broken flows,
            exposed data, and weeks of rework. Here's what "build first, plan never" costs you:
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
              className="group relative flex items-center gap-4 rounded-xl border border-border bg-card/60 p-5 overflow-hidden hover:border-destructive/40 transition-colors duration-300"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-destructive/0 group-hover:bg-destructive/60 transition-colors duration-300" />
              <div className="w-11 h-11 shrink-0 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:scale-105 transition-transform">
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