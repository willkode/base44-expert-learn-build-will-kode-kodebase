import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Cpu, FileCode2 } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    num: "01",
    title: "Describe your app",
    desc: "Say it in plain English: \u201cI want a contractor marketplace.\u201d That\u2019s enough to start.",
  },
  {
    icon: Cpu,
    num: "02",
    title: "Your AI architecture team plans it",
    desc: "Specialized AI agents think through structure, data, security, workflows, pages, and prompts \u2014 building a real build strategy, not a generic feature list.",
  },
  {
    icon: FileCode2,
    num: "03",
    title: "Get your Base44 build blueprint",
    desc: "Walk away with app overview, roles, entities, relationships, permissions, page map, build phases, and copy-paste Base44 prompts. Now you're building from a plan, not guessing.",
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
            From rough idea to <span className="text-gradient-orange">Base44-ready blueprint in minutes</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            You don't need to know the database structure, the workflows, or the permissions. That's what Kode Architect is for.
          </p>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-[4.25rem] left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />

          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative rounded-2xl border border-border bg-card/70 p-8 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="absolute top-6 right-7 font-sora font-extrabold text-5xl text-primary/10 group-hover:text-primary/20 transition-colors">
                {s.num}
              </span>
              <div className="relative w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
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