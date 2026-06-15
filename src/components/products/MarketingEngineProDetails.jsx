import React from "react";
import { motion } from "framer-motion";
import {
  Share2,
  Mail,
  MessageSquare,
  FileText,
  Sparkles,
  CalendarClock,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  Repeat,
  Layers,
  Workflow,
} from "lucide-react";

const engines = [
  {
    icon: Share2,
    name: "Social Media Engine",
    prompts: "24 prompts",
    tagline: "X/Twitter, Reddit, LinkedIn, Facebook & Instagram",
    points: [
      "Brand profiles & multi-platform campaigns",
      "AI posts with platform-specific variants & hashtags",
      "AI post images, OAuth account connections",
      "Approval workflow, scheduling & auto-publishing",
      "Per-platform publishing rules & analytics",
      "AI performance insights & content calendar auto-fill",
    ],
  },
  {
    icon: Mail,
    name: "Email Marketing Engine",
    prompts: "21 prompts",
    tagline: "Powered by Resend",
    points: [
      "Contacts, lists, segments & CSV import",
      "AI campaign generation, email builder & templates",
      "Approval workflow, scheduling & auto-send",
      "Automated drip sequences",
      "Resend webhooks, unsubscribe & suppression",
      "Analytics, AI insights & newsletter generation",
    ],
  },
  {
    icon: MessageSquare,
    name: "SMS Marketing Engine",
    prompts: "22 prompts",
    tagline: "Powered by Twilio",
    points: [
      "Contacts, lists, segments, consent & double opt-in",
      "AI message generation, builder, templates & short links",
      "Approval, scheduling, auto-send & drip sequences",
      "Twilio delivery callbacks & inbound reply inbox",
      "STOP/START/HELP handling & suppression",
      "Analytics, AI insights & signup forms",
    ],
  },
  {
    icon: FileText,
    name: "Auto Blogging Engine",
    prompts: "22 prompts",
    tagline: "AI SEO content engine",
    points: [
      "Full blog data models, admin dashboard & public pages",
      "AI post generation, featured images & SEO scoring",
      "Internal linking & content planning",
      "Scheduling, auto-publishing & approval workflow",
      "Analytics & Search Console insights",
      "Content refresh, repurposing & logs",
    ],
  },
];

const included = [
  { icon: Layers, title: "All 4 engines, one system", desc: "Social, Email, SMS, and Blog engines unified into a single multi-channel marketing platform — not four disconnected packs." },
  { icon: Sparkles, title: "87 sequential build prompts", desc: "Copy-paste prompts that guide Base44 step-by-step, in order, from app scan through QA and production readiness." },
  { icon: Repeat, title: "Cross-channel repurposing", desc: "Turn one piece of content into posts, emails, SMS, and blog articles — adapted to each channel's tone and rules." },
  { icon: Workflow, title: "Scan → build → QA → production", desc: "Every engine follows the same safe build flow: scan the existing app first, build incrementally, then a full QA & security pass." },
  { icon: ShieldCheck, title: "Approval & safety built in", desc: "Approval workflows, suppression, consent handling, and error recovery so nothing publishes or sends without a gate." },
  { icon: BarChart3, title: "Analytics & AI insights", desc: "Per-channel analytics plus AI performance insights that recommend what to post, send, and write next." },
];

const buildFlow = [
  { icon: FileText, label: "Full app scan", desc: "Map your pages, entities, routes, roles & permissions before anything is built." },
  { icon: Layers, label: "Core data models", desc: "Add the entities each engine needs with strict ownership rules." },
  { icon: Sparkles, label: "AI generation", desc: "Wire up content, image, and message generation per channel." },
  { icon: CalendarClock, label: "Scheduling & auto-send", desc: "Approval workflow, calendars, and background publishing jobs." },
  { icon: BarChart3, label: "Analytics & insights", desc: "Collect performance data and surface AI-powered recommendations." },
  { icon: CheckCircle2, label: "QA & production pass", desc: "Security audit, regression checks, and a production readiness review." },
];

export default function MarketingEngineProDetails() {
  return (
    <section className="max-w-5xl mx-auto mt-24">
      {/* What's inside */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">What's Inside</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          Four complete engines, <span className="text-gradient-orange">89 prompts</span>, one bundle
        </h2>
        <p className="text-lg text-muted-foreground">
          Kode Marketing Engine Pro bundles every standalone Kode marketing engine — Social, Email, SMS, and Blog —
          into one unified multi-channel system. Each engine is a sequential, copy-paste prompt pack that installs
          itself into your existing Base44 app without breaking what's already there.
        </p>
      </motion.div>

      {/* Engine breakdown */}
      <div className="grid sm:grid-cols-2 gap-5 mt-12">
        {engines.map((engine, i) => {
          const Icon = engine.icon;
          return (
            <motion.div
              key={engine.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-7"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f87171] via-[#fb923c] to-[#facc15] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#0a0f1e]" />
                </div>
                <div>
                  <h3 className="font-sora font-semibold text-lg leading-tight">{engine.name}</h3>
                  <p className="text-xs text-muted-foreground">{engine.tagline}</p>
                </div>
                <span className="ml-auto text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 whitespace-nowrap">
                  {engine.prompts}
                </span>
              </div>
              <ul className="space-y-2.5">
                {engine.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Why the bundle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mt-24"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Why The Bundle</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          A full <span className="text-gradient-orange">marketing platform</span>, not four separate packs
        </h2>
        <p className="text-lg text-muted-foreground">
          Buy the engines separately and you stitch four systems together yourself. Pro ships them as one coherent
          platform that shares brand context, content, and a consistent build flow across every channel.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        {included.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card/60 p-6 text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-sora font-semibold text-base mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* How it builds */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mt-24"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">How It Builds</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          The same safe flow for <span className="text-gradient-orange">every engine</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Each engine follows an identical, ordered build sequence — so you always know what's happening next and
          your existing app stays intact at every step.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        {buildFlow.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card p-6 text-left relative"
            >
              <span className="absolute top-5 right-5 font-sora font-bold text-2xl text-muted-foreground/20">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f87171] via-[#fb923c] to-[#facc15] flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#0a0f1e]" />
              </div>
              <h4 className="font-sora font-semibold text-base mb-2">{step.label}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}