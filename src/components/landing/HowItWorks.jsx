import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Cpu, FileCode2 } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    num: "01",
    title: "Describe your app",
    desc: "Tell us your idea in plain English. \u201cI want to build a contractor marketplace.\u201d That\u2019s all it takes to begin.",
  },
  {
    icon: Cpu,
    num: "02",
    title: "AI architects it",
    desc: "A full team of specialized AI architects designs your entities, roles, permissions, pages, and security model.",
  },
  {
    icon: FileCode2,
    num: "03",
    title: "Get your Build Blueprint",
    desc: "Receive a complete, platform-specific plan plus AI-ready prompts \u2014 build it right the first time.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 relative scroll-mt-20">
      <div className="absolute inset-0 blueprint-grid opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">How It Works</span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mt-4 mb-5">
            From idea to blueprint in 3 steps
          </h2>
          <p className="text-lg text-muted-foreground">
            No software degree required. Architect like a senior engineer in minutes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative rounded-2xl border border-border bg-card/70 p-8"
            >
              <span className="absolute top-6 right-7 font-sora font-extrabold text-5xl text-primary/10">
                {s.num}
              </span>
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                <s.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-sora font-bold text-xl mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}