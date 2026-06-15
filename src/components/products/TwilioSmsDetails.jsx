import React from "react";
import { motion } from "framer-motion";
import {
  ScanLine,
  Database,
  LayoutDashboard,
  Settings2,
  Users,
  ShieldOff,
  Filter,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  CalendarClock,
  Workflow,
  Webhook,
  Inbox,
  MousePointerClick,
  BarChart3,
  Lightbulb,
  FormInput,
  ShieldCheck,
  LifeBuoy,
  ClipboardCheck,
  Rocket,
} from "lucide-react";

const phases = [
  {
    name: "Scan & Foundation",
    icon: ScanLine,
    prompts: [
      { n: "01", icon: ScanLine, title: "Full App Scan Before Building", desc: "Analyzes your existing app structure and workflows before any development starts." },
      { n: "02", icon: Database, title: "Core SMS Data Models", desc: "Settings, contacts, lists, and campaigns — the essential database foundation." },
      { n: "03", icon: LayoutDashboard, title: "SMS Marketing UI Shell", desc: "Dashboard, contact lists, and main navigation routes for the system." },
      { n: "04", icon: Settings2, title: "Twilio Settings & Service Setup", desc: "Configuration page for Twilio credentials and messaging service settings." },
    ],
  },
  {
    name: "Audience & Consent",
    icon: Users,
    prompts: [
      { n: "05", icon: Users, title: "Contact Management & Importing", desc: "Manual contact entry and CSV data imports." },
      { n: "06", icon: ShieldOff, title: "Consent & Suppression Systems", desc: "Opt-in flows, opt-out logic, and global suppression list management." },
      { n: "07", icon: Filter, title: "Segments & Audience Targeting", desc: "A visual rule engine for dynamic segmentation and targeting." },
      { n: "08", icon: Sparkles, title: "AI SMS Generation Engine", desc: "An AI engine that generates SMS content for marketing campaigns." },
    ],
  },
  {
    name: "Sending & Automation",
    icon: Workflow,
    prompts: [
      { n: "09", icon: MessageSquare, title: "SMS Builder, Templates & Short Links", desc: "An SMS builder with reusable templates and trackable short links." },
      { n: "10", icon: CheckCircle2, title: "Approval Workflow", desc: "A multi-stage approval workflow and permission rules for campaigns." },
      { n: "11", icon: CalendarClock, title: "Scheduling & Auto-Send", desc: "Scheduling logic and automated background sending for SMS campaigns." },
      { n: "12", icon: Workflow, title: "Automated SMS Sequences", desc: "Drip sequences with triggers and enrollment logic for contacts." },
      { n: "13", icon: Webhook, title: "Twilio Delivery Status Callback", desc: "A receiver for Twilio status updates to track message delivery." },
    ],
  },
  {
    name: "Replies & Insights",
    icon: BarChart3,
    prompts: [
      { n: "14", icon: Inbox, title: "Inbound SMS Webhook & Inbox", desc: "An inbound SMS webhook and a reply inbox system." },
      { n: "15", icon: MousePointerClick, title: "Link Tracking & Click Analytics", desc: "SMS link tracking to measure clicks from marketing campaigns." },
      { n: "16", icon: BarChart3, title: "SMS Analytics Dashboard", desc: "An analytics dashboard built from send and event data." },
      { n: "17", icon: Lightbulb, title: "AI SMS Performance Insights", desc: "AI-powered insights that recommend improvements for your campaigns." },
      { n: "18", icon: FormInput, title: "Signup Forms & Lead Capture", desc: "Optional SMS signup and lead capture forms for subscribers." },
    ],
  },
  {
    name: "Safety & Launch",
    icon: ShieldCheck,
    prompts: [
      { n: "19", icon: ShieldCheck, title: "Admin Controls & Safety", desc: "Admin controls and safety limits for the marketing system." },
      { n: "20", icon: LifeBuoy, title: "Error Handling & Recovery", desc: "Robust error handling and recovery across the SMS system." },
      { n: "21", icon: ClipboardCheck, title: "Final QA & Security Audit", desc: "A full QA pass and security audit of the system." },
      { n: "22", icon: Rocket, title: "Production Readiness Pass", desc: "A final readiness pass to prepare the system for real users." },
    ],
  },
];

const outcomes = [
  { icon: Database, title: "Complete data layer", desc: "Contacts, lists, segments, campaigns, and sequences — modeled with strict admin-only access." },
  { icon: Sparkles, title: "AI SMS generation", desc: "Generate on-brand SMS campaigns, reusable templates, and trackable short links from your inputs." },
  { icon: ShieldOff, title: "Consent & compliance", desc: "Opt-in flows, STOP/START/HELP handling, suppression lists, and admin safety limits built in." },
  { icon: Workflow, title: "Approval, scheduling & drips", desc: "Review workflow, scheduled auto-send, and trigger-based automated sequences through Twilio." },
  { icon: Inbox, title: "Two-way messaging", desc: "Inbound reply inbox plus Twilio delivery callbacks to track every message's status." },
  { icon: BarChart3, title: "Analytics & AI insights", desc: "Click tracking, performance dashboards, AI recommendations, error recovery, and a final security audit." },
];

export default function TwilioSmsDetails() {
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
          builds safely, then layers in the data models, admin dashboard, Twilio integration, AI generation, consent,
          approval, scheduling, automated sequences, a reply inbox, analytics, and a final QA and production readiness
          pass — without breaking what you already have.
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
          A full <span className="text-gradient-orange">SMS marketing engine</span>, inside your own app
        </h2>
        <p className="text-lg text-muted-foreground">
          By the final prompt you own a complete, production-ready SMS marketing system powered by Twilio — no
          third-party platform, no recurring SaaS fees, fully integrated into your Base44 app.
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