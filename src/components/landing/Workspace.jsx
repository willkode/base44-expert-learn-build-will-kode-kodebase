import React from "react";
import { motion } from "framer-motion";
import { LayoutPanelLeft, FileText, Wand2, Sparkles, ShieldCheck, ClipboardCheck } from "lucide-react";

const tabs = [
  {
    icon: LayoutPanelLeft,
    title: "Overview",
    desc: "Your project command center — generation progress, launch-readiness score, and everything your app needs at a glance.",
    benefit: "Always know exactly what's done and what's next.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/b5376017e_generated_image.png",
  },
  {
    icon: FileText,
    title: "Blueprint",
    desc: "Your full architecture document: app summary, entities, relationships, roles, permissions, page map, workflows, and build phases.",
    benefit: "The complete plan Base44 needs before it builds.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/294834576_generated_image.png",
  },
  {
    icon: Wand2,
    title: "Prompt Pack",
    desc: "Sequenced, copy-paste Base44 prompts in the exact order you should build them — entities first, then auth, then features.",
    benefit: "Paste and build, instead of guessing what to prompt.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/e4641b131_generated_image.png",
  },
  {
    icon: Sparkles,
    title: "Optimization Prompts",
    desc: "Targeted prompts for UI redesigns, sales copy, SEO, conversion, and performance — plus a generator for custom requests.",
    benefit: "Improve any part of your app with one paste.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/1bc9e85c6_generated_image.png",
  },
  {
    icon: ShieldCheck,
    title: "Security Review",
    desc: "Automated audit of permissions, ownership rules, and access control — each finding comes with a ready-to-paste fix prompt.",
    benefit: "Catch exposed data before your users do.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/47f609685_generated_image.png",
  },
  {
    icon: ClipboardCheck,
    title: "QA Checklist",
    desc: "A generated test plan covering every core flow, with audit prompts you can paste to verify each one before launch.",
    benefit: "Ship knowing every flow actually works.",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/7f58c98d1_generated_image.png",
  },
];

export default function Workspace() {
  return (
    <section id="workspace" className="py-24 relative scroll-mt-20">
      <div className="absolute inset-0 blueprint-grid opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Inside Your Workspace</span>
          <h2 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mt-4 mb-5">
            Everything to <span className="text-gradient-orange">plan, build, and launch — in one project</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Every project gets its own workspace with six dedicated tabs. Move from architecture to
            build prompts to a clean, secure launch — without ever leaving the plan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tabs.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="group relative rounded-2xl border border-border bg-card/70 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={t.image}
                  alt={t.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
              </div>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-7 pt-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-300">
                  <t.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="font-sora font-bold text-lg mb-2">{t.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t.desc}</p>
              <p className="text-sm font-medium text-primary">{t.benefit}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}