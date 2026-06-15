import React from "react";
import { motion } from "framer-motion";
import {
  ScanLine,
  Database,
  LayoutDashboard,
  Mail,
  Users,
  Filter,
  Sparkles,
  PenLine,
  CheckCircle2,
  CalendarClock,
  Workflow,
  Webhook,
  ShieldOff,
  BarChart3,
  Lightbulb,
  Newspaper,
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
      { n: "01", icon: ScanLine, title: "Full App Scan Before Building", desc: "Scans your existing app to create a safe, detailed implementation and integration plan." },
      { n: "02", icon: Database, title: "Core Email Data Models", desc: "Settings, contacts, lists, segments, campaigns, and automated sequences — the database foundation." },
      { n: "03", icon: LayoutDashboard, title: "Email Marketing UI Shell", desc: "Navigation, dashboard, and admin pages for managing the whole email system." },
      { n: "04", icon: Mail, title: "Resend Settings & Sending Identity", desc: "Configures Resend, sender identities, compliance defaults, and backend connectivity checks." },
    ],
  },
  {
    name: "Audience & Content",
    icon: Users,
    prompts: [
      { n: "05", icon: Users, title: "Contacts, Importing, Tags & Lists", desc: "Contact tables, CSV import, tagging, and manual list management." },
      { n: "06", icon: Filter, title: "Segments & Audience Targeting", desc: "A visual rule builder for dynamic segmentation and campaign targeting logic." },
      { n: "07", icon: Sparkles, title: "AI Email Generation Engine", desc: "A backend engine that generates complete email campaigns with AI from your inputs." },
      { n: "08", icon: PenLine, title: "Email Builder & Template System", desc: "Campaign editor with plain-text, HTML, personalization, and reusable templates." },
    ],
  },
  {
    name: "Sending & Automation",
    icon: Workflow,
    prompts: [
      { n: "09", icon: CheckCircle2, title: "Approval Workflow", desc: "A multi-status approval process so campaigns are reviewed before sending." },
      { n: "10", icon: CalendarClock, title: "Scheduling & Auto-Send", desc: "Schedule, cancel, and automatically process email campaigns through Resend." },
      { n: "11", icon: Workflow, title: "Automated Email Sequences", desc: "Drip campaigns with trigger-based enrollment and configurable step delays." },
      { n: "12", icon: Webhook, title: "Resend Webhook Receiver", desc: "A backend function to process and store Resend delivery and engagement events." },
      { n: "13", icon: ShieldOff, title: "Unsubscribe & Suppression", desc: "Automated unsubscribe handling and mandatory suppression for all marketing email." },
    ],
  },
  {
    name: "Insights & Growth",
    icon: BarChart3,
    prompts: [
      { n: "14", icon: BarChart3, title: "Analytics Dashboard", desc: "Track campaign, sequence, and contact metrics in one comprehensive dashboard." },
      { n: "15", icon: Lightbulb, title: "AI Performance Insights", desc: "AI analyzes performance and generates actionable improvement recommendations." },
      { n: "16", icon: Newspaper, title: "Newsletter Auto-Generation", desc: "Automatically generate and schedule newsletters from your app updates." },
      { n: "17", icon: FormInput, title: "Signup Form Capture", desc: "Signup forms and lead capture to grow your email marketing lists." },
    ],
  },
  {
    name: "Safety & Launch",
    icon: ShieldCheck,
    prompts: [
      { n: "18", icon: ShieldCheck, title: "Admin Controls, Limits & Safety", desc: "Admin controls, send limits, and safety guardrails for the system." },
      { n: "19", icon: LifeBuoy, title: "Error Handling & Recovery", desc: "Robust error handling and recovery tools across the entire system." },
      { n: "20", icon: ClipboardCheck, title: "Final QA & Security Audit", desc: "A full QA pass and security audit of the completed system." },
      { n: "21", icon: Rocket, title: "Production Readiness Pass", desc: "A final review to prepare the system for real users." },
    ],
  },
];

const outcomes = [
  { icon: Database, title: "Complete data layer", desc: "Contacts, lists, segments, campaigns, sequences, and settings — modeled with strict admin-only access." },
  { icon: Sparkles, title: "AI campaigns & newsletters", desc: "Generate full email campaigns, reusable templates, and newsletters automatically from your inputs." },
  { icon: Filter, title: "Targeting & personalization", desc: "Visual segment rules and personalization so the right message reaches the right contacts." },
  { icon: Workflow, title: "Approval, scheduling & drips", desc: "Review workflow, scheduled auto-send, and trigger-based automated sequences through Resend." },
  { icon: BarChart3, title: "Analytics & AI insights", desc: "Delivery, open, and click tracking via Resend webhooks, plus AI-powered improvement recommendations." },
  { icon: ShieldOff, title: "Compliance built in", desc: "Unsubscribe, suppression, admin limits, error recovery, and a final QA and security audit." },
];

export default function ResendEmailDetails() {
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
          21 sequential prompts: <span className="text-gradient-orange">scan → build → QA → production</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          You copy and paste each prompt into Base44 in order. The pack starts by scanning your existing app so it
          builds safely, then layers in the data models, admin dashboard, Resend integration, AI generation, builder,
          approval, scheduling, automated sequences, analytics, and a final QA and production readiness pass — without
          breaking what you already have.
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
          A full <span className="text-gradient-orange">email marketing engine</span>, inside your own app
        </h2>
        <p className="text-lg text-muted-foreground">
          By the final prompt you own a complete, production-ready email marketing system powered by Resend — no
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