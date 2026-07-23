import React from "react";
import { motion } from "framer-motion";
import { ScanSearch, Bot, ListOrdered, ShieldCheck, Wrench, Trophy, CheckCircle2, Users, Sparkles } from "lucide-react";

const sections = [
  { icon: ScanSearch, title: "Full app scan", desc: "Reviews pages, entities, roles, permissions, workflows, backend functions, automations, and admin areas — read-only, nothing is changed." },
  { icon: Bot, title: "Agent opportunities", desc: "Recommends AI agents specific to your app — purpose, users, data access, and exactly what each agent should and should not be allowed to do." },
  { icon: Sparkles, title: "App-specific use cases", desc: "Every recommended agent comes with a short, concrete use case example pulled from your actual app — not generic chatbot ideas." },
  { icon: ListOrdered, title: "Priority ranking", desc: "Agents ranked must-have, should-have, could-have, and future idea — with reasoning for each so you know where to start." },
  { icon: ShieldCheck, title: "Safe permissions", desc: "Read/write/admin access recommendations, human-approval requirements, and security risks to avoid for every agent." },
  { icon: Wrench, title: "Implementation notes", desc: "Entities to create or reuse, backend functions needed, UI pages, notifications, and the audit trails each agent requires." },
];

const outcomes = [
  "Stop guessing which AI agents are worth building",
  "Get recommendations grounded in your real app, not templates",
  "Know exactly what data each agent needs — and shouldn't touch",
  "Ship agents safely with permission boundaries from day one",
  "Cut manual work for users and admins with the right automations",
  "Walk away with a clear top-3 build order",
];

const audience = [
  "Base44 builders who know they want AI agents but not which ones",
  "Founders adding premium AI features without breaking their app",
  "Agencies scoping AI agent work for client apps",
  "Admins drowning in repetitive tasks agents could handle",
];

export default function AiAgentRecommenderDetails() {
  return (
    <section className="max-w-5xl mx-auto mt-24">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">What It Does</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          Your app's <span className="text-gradient-orange">AI agent strategy</span> in one report
        </h2>
        <p className="text-lg text-muted-foreground">
          One prompt. Zero changes to your app. The AI Agent Recommender scans everything you've built and hands back a
          7-section report telling you which agents to build, who they serve, what they're allowed to do, and where to start.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        {sections.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }} className="rounded-2xl border border-border bg-card p-6 text-left">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f87171] via-[#fb923c] to-[#facc15] flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#0a0f1e]" />
              </div>
              <h4 className="font-sora font-semibold text-base mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-24 rounded-2xl border border-border bg-card p-8 md:p-10">
        <h3 className="font-sora font-bold text-xl mb-6 text-center">What you'll walk away with</h3>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {outcomes.map((o) => (
            <div key={o} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>{o}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto mt-24">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Who It's For</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          Built for builders who want agents <span className="text-gradient-orange">done right</span>
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-5 mt-12">
        {audience.map((a, i) => (
          <motion.div key={a} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }} className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-6 text-left">
            <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground leading-relaxed">{a}</span>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto mt-24">
        <Trophy className="w-8 h-8 text-primary mx-auto mb-5" />
        <h2 className="font-sora font-bold text-3xl tracking-tight mb-5">
          Know your <span className="text-gradient-orange">top 3 agents</span> before writing a single prompt
        </h2>
        <p className="text-lg text-muted-foreground">
          The report ends with a clear recommendation of the three agents you should build first — chosen for your app,
          your users, and your workflows. No wasted builds, no generic chatbots.
        </p>
      </motion.div>
    </section>
  );
}