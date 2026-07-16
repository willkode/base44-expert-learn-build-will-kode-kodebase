import React from "react";
import { motion } from "framer-motion";
import {
  Search, BookOpen, ClipboardCheck, Map, Users, Layers, FileText, Database,
  Workflow, Plug, Bell, Shield, CheckCircle2, FileSearch, Lock,
} from "lucide-react";

const phases = [
  {
    icon: Search,
    step: "Phase 1",
    title: "Application Discovery",
    desc: "The prompt performs a read-only sweep of your entire app — every route, page, component, entity, form, workflow, automation, integration, user role, permission, and setting. Nothing is modified, ever.",
  },
  {
    icon: BookOpen,
    step: "Phase 2",
    title: "Build the Knowledge Base",
    desc: "Everything discovered is turned into a 12-section knowledge base: getting started, navigation, role guides, feature guides, common workflows, an administrator guide, FAQs, troubleshooting, and a glossary.",
  },
  {
    icon: ClipboardCheck,
    step: "Phase 3",
    title: "Quality Review & Audit",
    desc: "Before finalizing, the prompt verifies every major route, feature, and role is covered, strips technical jargon, flags anything unverified, and confirms no secrets or sensitive data are included.",
  },
];

const covers = [
  { icon: Map, label: "Navigation & Routes", desc: "Every page, who can access it, and how to reach it" },
  { icon: Users, label: "Roles & Permissions", desc: "What each role can view, create, edit, and delete" },
  { icon: Layers, label: "Features & Modules", desc: "Step-by-step usage guides for every feature" },
  { icon: FileText, label: "Forms", desc: "Required fields, validation, and where data goes" },
  { icon: Database, label: "Entities & Data", desc: "Your data model explained in plain language" },
  { icon: Workflow, label: "Automations", desc: "Triggers, actions, and how to verify they ran" },
  { icon: Plug, label: "Integrations", desc: "Setup requirements and common errors — no secrets" },
  { icon: Bell, label: "Notifications", desc: "What triggers each one and who receives it" },
  { icon: Shield, label: "Admin Controls", desc: "A dedicated administrator guide, kept separate" },
];

const outputs = [
  {
    file: "APP-KNOWLEDGE-BASE.md",
    desc: "The finished knowledge base — detailed enough that a brand-new user can understand your application and complete its primary workflows without any assistance.",
  },
  {
    file: "KNOWLEDGE-BASE-AUDIT.md",
    desc: "A separate audit summary: totals for routes, features, roles, entities, automations, and integrations reviewed — plus incomplete features, documentation gaps, and recommended updates.",
  },
];

const safety = [
  "100% read-only — never changes code, data, permissions, or settings",
  "Never invents features that don't exist",
  "Clearly labels anything that couldn't be verified",
  "Never exposes passwords, API keys, tokens, or private user data",
  "Flags broken, placeholder, and incomplete features separately",
];

export default function AppKnowledgeBaseDetails() {
  return (
    <div className="mt-24">
      {/* How it works */}
      <div className="max-w-3xl mx-auto text-center mb-14">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">How it works</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          Three phases. <span className="text-gradient-orange">Zero changes to your app.</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Paste one prompt into your Base44 chat and it runs a complete documentation audit — discovery, writing, and quality review.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {phases.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-card p-7"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <p.icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">{p.step}</p>
            <h3 className="font-sora font-semibold text-lg mb-2">{p.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* What it documents */}
      <div className="max-w-3xl mx-auto text-center mt-24 mb-12">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Coverage</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          Everything in your app, <span className="text-gradient-orange">documented.</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {covers.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40 transition-colors"
          >
            <c.icon className="w-5 h-5 text-primary mb-3" />
            <p className="font-semibold text-sm text-foreground mb-1">{c.label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Deliverables */}
      <div className="max-w-3xl mx-auto text-center mt-24 mb-12">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">What you get</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          Two polished files, <span className="text-gradient-orange">ready to share.</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        {outputs.map((o) => (
          <div key={o.file} className="rounded-2xl border border-primary/30 bg-primary/5 p-7">
            <div className="flex items-center gap-3 mb-3">
              <FileSearch className="w-5 h-5 text-primary shrink-0" />
              <code className="font-mono text-sm font-semibold text-primary">{o.file}</code>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{o.desc}</p>
          </div>
        ))}
      </div>

      {/* Safety */}
      <div className="max-w-4xl mx-auto mt-20 rounded-2xl border border-border bg-card p-8">
        <h3 className="font-sora font-semibold text-xl mb-5 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" /> Built-in safety rules
        </h3>
        <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3">
          {safety.map((s) => (
            <li key={s} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}