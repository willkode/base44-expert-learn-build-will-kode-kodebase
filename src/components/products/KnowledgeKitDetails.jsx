import React from "react";
import { motion } from "framer-motion";
import KitProblem from "@/components/products/knowledge-kit/KitProblem";
import KitFailures from "@/components/products/knowledge-kit/KitFailures";
import KitSolutions from "@/components/products/knowledge-kit/KitSolutions";
import KitAudience from "@/components/products/knowledge-kit/KitAudience";
import KitWorkflow from "@/components/products/knowledge-kit/KitWorkflow";
import KitFAQ from "@/components/products/knowledge-kit/KitFAQ";

const SKILLS = [
  { title: "Prompt Engineering", description: "Golden rules for prompting the Base44 AI — one feature per prompt, architecture before features, and patterns that produce production-quality results." },
  { title: "Mobile App Wrapper", description: "How Base44 apps publish to iOS and Android from the same React codebase — responsive design requirements, breakpoints, and platform-specific considerations." },
  { title: "Workspace & UI Guide", description: "Complete map of the Base44 builder interface — where everything lives, how to navigate the editor, and the team/role structure." },
  { title: "Visual Builder Features", description: "Deep dive into the chat-based AI builder — message types, preview panel behavior, and how changes deploy instantly without a build step." },
  { title: "Complete SDK Reference", description: "Every namespace and method in the Base44 SDK — entities, auth, integrations, analytics — with copy-paste usage examples." },
  { title: "Error Encyclopedia", description: "Every common error, its cause, and the exact fix — from build failures to runtime crashes. Saves countless debugging hours." },
  { title: "Platform Limits", description: "Known limits and constraints of the Base44 platform — entity limits, bulk operation caps, field sizes, and query depth guidance." },
  { title: "Credits & Billing", description: "How credits work, what each model costs, and optimization strategies to reduce spend without sacrificing quality." },
  { title: "Security Best Practices", description: "Authentication, authorization, RLS rules, data protection, and threat prevention — everything to keep your app and user data safe." },
  { title: "Performance Optimization", description: "Data fetching with React Query, rendering strategies, bundle optimization, and pagination patterns for fast, responsive apps." },
  { title: "SEO & Accessibility", description: "Metadata management, Open Graph tags, structured data, WCAG compliance, and making Base44 apps discoverable and usable by everyone." },
  { title: "Production Readiness", description: "The complete pre-launch checklist — auth flows, data model, permissions, security, performance, and everything to verify before going live." },
  { title: "Workflow Cookbook", description: "Practical automation recipes — scheduled cleanups, entity triggers, connector webhooks — with full code examples for each pattern." },
  { title: "Connector Cookbook", description: "Integration recipes for every major connector — Google Calendar, Slack, Gmail, Drive — with the decision flow and code for each." },
  { title: "Agent Cookbook", description: "Building AI agents in Base44 — config structure, tool permissions, conversation UI, and practical agent recipes that work." },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function KnowledgeKitDetails() {
  return (
    <div className="mt-24 space-y-0">
      <KitProblem />
      <KitFailures />
      <KitSolutions />
      <KitAudience />
      <KitWorkflow />
      <KitFAQ />

      {/* 15 Skills Grid */}
      <div className="max-w-5xl mx-auto mt-24">
        <div className="text-center mb-10">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">15 Skills Included</span>
          <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-4">
            Every skill your AI needs to{" "}
            <span className="text-gradient-orange">master Base44</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each document is a focused, copy-paste-ready reference. Together they give any AI assistant
            complete platform knowledge — so it builds right the first time, every time.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SKILLS.map((skill, idx) => (
            <motion.div
              key={idx}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4) }}
              className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors"
            >
              <span className="text-xs font-mono text-muted-foreground block mb-3">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <h3 className="font-semibold text-base mb-2">{skill.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{skill.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}