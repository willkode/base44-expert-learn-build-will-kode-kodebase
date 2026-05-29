import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Layers, Lock, Copy, Workflow, EyeOff, Bug } from "lucide-react";

const problems = [
  { icon: Layers, text: "Duplicated entities & a messy data model" },
  { icon: Lock, text: "Weak permissions that expose user data" },
  { icon: Copy, text: "Missing admin features & half-built flows" },
  { icon: Workflow, text: "Broken user flows that lose people" },
  { icon: EyeOff, text: "Endless bug chasing" },
  { icon: Bug, text: "Wasted message credits fixing avoidable mistakes" },
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
            Conversational AI builds are great — until your app gets complicated.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            "Build me a dashboard" works fine. But real apps have users, roles, permissions, admin
            flows, data relationships, payments, and security rules — and a simple conversation isn't
            enough. Without structured prompts, Base44 has to guess. And when AI guesses, you get:
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

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-lg md:text-xl font-sora font-semibold mt-12"
        >
          The problem isn't Base44. <span className="text-gradient-orange">The problem is building without a plan.</span>
        </motion.p>
      </div>
    </section>
  );
}