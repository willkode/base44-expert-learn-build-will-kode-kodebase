import React from "react";
import { motion } from "framer-motion";
import { Bot, MessageSquare, BookOpen, UserCog, ShieldCheck, Gauge, Users, Sparkles, CheckCircle2 } from "lucide-react";

const builds = [
  { icon: MessageSquare, title: "Support agent", desc: "A customer-facing AI agent grounded in your knowledge base that answers real questions." },
  { icon: Bot, title: "Onboarding concierge", desc: "An agent that guides new users through setup and gets them to first value faster." },
  { icon: UserCog, title: "Admin copilot", desc: "An internal agent that answers questions about your data and runs admin workflows." },
  { icon: BookOpen, title: "Knowledge grounding", desc: "Feed agents your docs, FAQs, and app data so answers are accurate, not hallucinated." },
  { icon: ShieldCheck, title: "Permission scoping", desc: "Lock each agent down to exactly the data and actions it's allowed to touch." },
  { icon: Gauge, title: "Escalation & controls", desc: "Human handoff flows, conversation review, and usage/cost controls built in." },
];

const outcomes = [
  "Answer support questions 24/7 without hiring",
  "Turn new signups into activated users automatically",
  "Give admins a copilot that knows the whole app",
  "Keep agents safe with strict permission boundaries",
  "Escalate to a human when the AI hits its limit",
  "Build polished chat UIs users actually enjoy",
];

const audience = [
  "SaaS founders who want AI-native products",
  "Builders adding premium AI features to client apps",
  "Solo operators replacing support workload with agents",
  "Agencies selling AI agent installs as a service",
];

export default function AgentWorkforceDetails() {
  return (
    <section className="max-w-5xl mx-auto mt-24">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">What It Builds</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          A team of <span className="text-gradient-orange">AI agents</span> inside your app
        </h2>
        <p className="text-lg text-muted-foreground">
          This isn't a chatbot tutorial. It's a full prompt system for embedding a working AI workforce into any app —
          support, onboarding, and admin agents with knowledge grounding, permission scoping, conversation UIs, and
          human escalation.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        {builds.map((item, i) => {
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
        <h3 className="font-sora font-bold text-xl mb-6 text-center">What your agents will do for you</h3>
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
          For builders at the <span className="text-gradient-orange">AI frontier</span>
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
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-5" />
        <h2 className="font-sora font-bold text-3xl tracking-tight mb-5">
          Your app, <span className="text-gradient-orange">staffed by AI</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Apps with real AI agents feel premium — and charge premium. This system gives you the exact sequential build
          path to ship agents that are useful, safe, and production-ready.
        </p>
      </motion.div>
    </section>
  );
}