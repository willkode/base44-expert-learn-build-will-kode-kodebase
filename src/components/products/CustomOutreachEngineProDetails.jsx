import React from "react";
import { motion } from "framer-motion";
import {
  Target,
  Globe,
  Brain,
  Gauge,
  Sparkles,
  Workflow,
  ShieldCheck,
  CheckCircle2,
  Users,
  HelpCircle,
  Layers,
  Send,
} from "lucide-react";

const builds = [
  { icon: Target, title: "Campaign & ICP builder", desc: "Define your ideal customer profile and spin up targeted outreach campaigns." },
  { icon: Globe, title: "Public data + scraping", desc: "Public data source manager and a website scraping workflow — public data only." },
  { icon: Brain, title: "AI website analysis", desc: "Analyze each company's site to surface real problems and opportunities." },
  { icon: Gauge, title: "Lead scoring & offer match", desc: "Rank the best prospects and recommend exactly what to pitch them." },
  { icon: Send, title: "Personalized outreach", desc: "Generate messages based on actual research — specific, useful, and human." },
  { icon: Layers, title: "CRM pipeline", desc: "Track the full sales process with a clean, simple pipeline." },
];

const questions = [
  "Who should I contact?",
  "Why are they a good fit?",
  "What problems do they have?",
  "What should I offer them?",
  "What should I say?",
  "When should I follow up?",
  "Which leads are actually worth my time?",
];

const audience = [
  "Vibe coders selling websites, apps, automations, or AI systems",
  "Freelancers looking for better client acquisition",
  "Agencies that want smarter lead research",
  "Base44 builders creating business tools",
  "AI builders creating internal sales systems",
  "Service providers who need a repeatable outreach workflow",
];

const compliance = [
  "Public data only",
  "No login-protected scraping",
  "No CAPTCHA bypassing",
  "No private profile scraping",
  "No sensitive personal data collection",
  "Rate limiting & duplicate prevention",
  "Do Not Contact & suppression lists",
  "Opt-out tracking",
  "Human approval before outreach",
  "Compliance review before sending",
];

const mvp = [
  "Campaign setup",
  "Manual URL input",
  "Public website scraping",
  "AI website analysis",
  "Lead scoring",
  "Message generation",
  "Human approval",
  "CRM pipeline",
  "Manual outreach / export",
];

export default function CustomOutreachEngineProDetails() {
  return (
    <section className="max-w-5xl mx-auto mt-24">
      {/* What it builds */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">What It Builds</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          A full <span className="text-gradient-orange">outreach operating system</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          This is not just a scraper. It's a complete lead intelligence and outreach system — the scraper collects
          public data, AI analyzes each website, scoring ranks the best prospects, the offer matcher recommends what
          to pitch, the generator writes personalized messages, and the CRM tracks the whole process.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        {builds.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-6 text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f87171] via-[#fb923c] to-[#facc15] flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#0a0f1e]" />
              </div>
              <h4 className="font-sora font-semibold text-base mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Questions it answers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mt-24"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Why It's Valuable</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          Turn outreach from guessing into a <span className="text-gradient-orange">repeatable system</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Most people send the same weak message to everyone. The advantage now is personalization at scale — but only
          when it's based on real research. This system helps you answer the questions that actually matter:
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-3 mt-12 max-w-3xl mx-auto">
        {questions.map((q, i) => (
          <motion.div
            key={q}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-5 py-4"
          >
            <HelpCircle className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm">{q}</span>
          </motion.div>
        ))}
      </div>

      {/* Compliance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-24 rounded-2xl border border-border bg-card p-8 md:p-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-sora font-bold text-xl">Built-in safety & compliance logic</h3>
            <p className="text-sm text-muted-foreground">Guardrails for responsible, review-based outreach.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {compliance.map((c) => (
            <div key={c} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* MVP path */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mt-24"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">MVP First, Advanced Later</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          A simplified <span className="text-gradient-orange">MVP path</span> so you don't get overwhelmed
        </h2>
        <p className="text-lg text-muted-foreground">
          Start with a focused MVP, then expand into integrations, sequence management, reporting, reply tracking, and
          deeper automation once it works.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-2.5 mt-10">
        {mvp.map((step, i) => (
          <motion.span
            key={step}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm"
          >
            <Workflow className="w-3.5 h-3.5 text-primary" />
            {step}
          </motion.span>
        ))}
      </div>

      {/* Who it's for */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mt-24"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Who It's For</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          Built for <span className="text-gradient-orange">client acquisition</span>
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        {audience.map((a, i) => (
          <motion.div
            key={a}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-6 text-left"
          >
            <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground leading-relaxed">{a}</span>
          </motion.div>
        ))}
      </div>

      {/* Bottom line */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mt-24"
      >
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-5" />
        <h2 className="font-sora font-bold text-3xl tracking-tight mb-5">
          A real <span className="text-gradient-orange">outreach machine</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          No more random scraping. No more generic cold emails. No more guessing who to contact. Just a smarter, safer,
          more strategic outreach system built with AI — one that researches prospects, finds opportunities, scores
          leads, writes personalized messages, and keeps the entire workflow organized.
        </p>
      </motion.div>
    </section>
  );
}