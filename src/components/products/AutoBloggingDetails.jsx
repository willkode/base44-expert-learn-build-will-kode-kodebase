import React from "react";
import { motion } from "framer-motion";
import {
  ScanLine,
  Database,
  LayoutDashboard,
  Globe,
  Settings2,
  Tags,
  Sparkles,
  PenLine,
  ImageIcon,
  Gauge,
  Link2,
  CalendarClock,
  Send,
  CheckCircle2,
  BarChart3,
  Search,
  RefreshCw,
  Share2,
  ScrollText,
  ShieldCheck,
  ClipboardCheck,
  Rocket,
} from "lucide-react";

const phases = [
  {
    name: "Scan & Foundation",
    icon: ScanLine,
    prompts: [
      { n: "01", icon: ScanLine, title: "Full App Scan Before Building", desc: "Analyzes your existing structure and flows to plan a safe build that won't break current features." },
      { n: "02", icon: Database, title: "Core Blog Data Models", desc: "Settings, posts, categories, tags, topic clusters, and analytics — the full database foundation." },
      { n: "03", icon: LayoutDashboard, title: "Blog Admin UI Shell", desc: "Admin dashboard, widgets, and navigation routes for managing the whole system." },
      { n: "04", icon: Globe, title: "Public Blog Pages", desc: "User-facing blog index, post, category, and tag pages." },
    ],
  },
  {
    name: "Content & AI Engine",
    icon: Sparkles,
    prompts: [
      { n: "05", icon: Settings2, title: "Blog Settings & SEO Defaults", desc: "Global blog configuration, brand voice, and default SEO/meta templates." },
      { n: "06", icon: Tags, title: "Categories, Tags & Slug Management", desc: "Taxonomy management with unique, URL-friendly slug handling." },
      { n: "07", icon: Sparkles, title: "AI Blog Post Generation Engine", desc: "Generate full SEO-ready articles from a topic, keyword, or brief." },
      { n: "08", icon: PenLine, title: "Blog Editor & Manual Creation", desc: "A full editor to write, refine, and manually create posts." },
      { n: "09", icon: ImageIcon, title: "AI Featured Image Generation", desc: "On-brand featured images generated automatically for every post." },
    ],
  },
  {
    name: "SEO & Distribution",
    icon: Gauge,
    prompts: [
      { n: "10", icon: Gauge, title: "SEO Scoring & Optimization", desc: "Score each post and surface an actionable optimization checklist." },
      { n: "11", icon: Link2, title: "Internal Linking System", desc: "Suggest and apply internal links between related posts automatically." },
      { n: "12", icon: CalendarClock, title: "Content Planning & Calendar", desc: "Plan content, generate ideas, and auto-fill a publishing calendar." },
      { n: "13", icon: Send, title: "Scheduling & Auto-Publishing", desc: "Schedule posts and publish them automatically in the background." },
    ],
  },
  {
    name: "Workflow & Insights",
    icon: BarChart3,
    prompts: [
      { n: "14", icon: CheckCircle2, title: "Approval Workflow", desc: "Approval statuses and rules so posts are reviewed before they go live." },
      { n: "15", icon: BarChart3, title: "Blog Analytics Tracking", desc: "Internal tracking for pageviews, clicks, and post performance." },
      { n: "16", icon: Search, title: "Search Console Integration", desc: "Optional SEO tracking to find ranking opportunities and impressions." },
      { n: "17", icon: RefreshCw, title: "Content Refresh Recommendations", desc: "Identify weak posts and suggest specific AI-powered updates." },
      { n: "18", icon: Share2, title: "AI Repurposing To Channels", desc: "Turn blog posts into social, email, and other channel content." },
    ],
  },
  {
    name: "Safety & Launch",
    icon: ShieldCheck,
    prompts: [
      { n: "19", icon: ScrollText, title: "Automation Logs & Error Handling", desc: "Audit logs and recovery tools for every automated action." },
      { n: "20", icon: ShieldCheck, title: "Admin Controls, Limits & Safety", desc: "Guardrails, rate limits, and admin-only safety controls." },
      { n: "21", icon: ClipboardCheck, title: "Final QA & Security Audit", desc: "A complete QA pass plus a security audit of the whole system." },
      { n: "22", icon: Rocket, title: "Production Readiness Pass", desc: "Final checks to confirm the system is ready for real traffic." },
    ],
  },
];

const outcomes = [
  { icon: Database, title: "Complete data layer", desc: "Posts, categories, tags, topic clusters, settings, and analytics — modeled with strict admin-only access." },
  { icon: Sparkles, title: "AI generation built in", desc: "Generate full articles and on-brand featured images, then score and optimize each post for SEO." },
  { icon: CalendarClock, title: "Plan, schedule, auto-publish", desc: "A content calendar with idea generation, scheduling, and background auto-publishing." },
  { icon: CheckCircle2, title: "Approval & safety gates", desc: "Review workflow, admin limits, error logs, and recovery tools so nothing publishes unchecked." },
  { icon: BarChart3, title: "Analytics & Search Console", desc: "First-party performance tracking plus optional Google Search Console SEO insights." },
  { icon: RefreshCw, title: "Refresh & repurpose", desc: "Spot decaying posts, apply AI-powered refreshes, and repurpose content to other channels." },
];

export default function AutoBloggingDetails() {
  return (
    <section className="max-w-5xl mx-auto mt-24">
      {/* Intro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Inside The Pack</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          22 sequential prompts: <span className="text-gradient-orange">scan → build → QA → production</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          You copy and paste each prompt into Base44 in order. The pack starts by scanning your existing app so it
          builds safely, then layers in the data models, admin dashboard, public pages, AI engine, SEO, scheduling,
          approval, analytics, and a final QA and production readiness pass — without breaking what you already have.
        </p>
      </motion.div>

      {/* Phase + prompt breakdown */}
      <div className="mt-14 space-y-12">
        {phases.map((phase, pi) => {
          const PhaseIcon = phase.icon;
          return (
            <motion.div
              key={phase.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#f87171] via-[#fb923c] to-[#facc15] flex items-center justify-center shrink-0">
                  <PhaseIcon className="w-4.5 h-4.5 text-[#0a0f1e]" />
                </div>
                <h3 className="font-sora font-semibold text-xl">
                  Phase {pi + 1}
                  <span className="text-muted-foreground font-normal"> · {phase.name}</span>
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {phase.prompts.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div
                      key={p.n}
                      className="flex items-start gap-4 rounded-xl border border-border bg-card/60 p-5 relative"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-sora font-bold text-xs text-gradient-orange">{p.n}</span>
                          <h4 className="font-sora font-semibold text-sm">{p.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* What you end up with */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mt-24"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">What You End Up With</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          A full <span className="text-gradient-orange">AI content engine</span>, inside your own app
        </h2>
        <p className="text-lg text-muted-foreground">
          By the final prompt you own a complete, production-ready auto blogging system — no third-party CMS, no
          recurring SaaS fees, fully integrated into your Base44 app.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        {outcomes.map((item, i) => {
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
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-sora font-semibold text-base mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}