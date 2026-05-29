import React from "react";
import { motion } from "framer-motion";
import { Boxes, Database, ShieldCheck, Palette, Server, ClipboardCheck, Wand2 } from "lucide-react";

const agents = [
  { icon: Boxes, name: "Product Architect", desc: "Turns your idea into features, user types, flows, and scope." },
  { icon: Database, name: "Database Architect", desc: "Designs entities, relationships, field names, and data rules." },
  { icon: ShieldCheck, name: "Security Architect", desc: "Reviews permissions, ownership, role access, and risky flows." },
  { icon: Palette, name: "UI Architect", desc: "Maps page structure, layouts, components, and user journeys." },
  { icon: Server, name: "Backend Architect", desc: "Plans backend functions, automations, integrations, and APIs." },
  { icon: ClipboardCheck, name: "QA Agent", desc: "Creates test cases, launch checklist, and bug-risk areas." },
  { icon: Wand2, name: "Prompt Engineer", desc: "Turns the full plan into platform-specific build prompts." },
];

export default function Agents() {
  return (
    <section id="agents" className="py-24 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">The AI Architecture Team</span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mt-4 mb-5">
            You're not chatting with a bot.
          </h2>
          <p className="text-lg text-muted-foreground">
            You're running your idea through a full team of specialized architects — each an expert in their domain.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="group relative rounded-2xl border border-border bg-card/70 p-7 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-5 group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-300">
                <a.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-sora font-bold text-lg mb-2">{a.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="relative rounded-2xl border border-primary/30 bg-primary/5 p-7 flex flex-col justify-center overflow-hidden glow-orange"
          >
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <h3 className="relative font-sora font-bold text-lg mb-2 text-gradient-orange">7 Agents. One Blueprint.</h3>
            <p className="relative text-sm text-muted-foreground leading-relaxed">
              Every architect contributes to a single, cohesive plan ready to build.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}