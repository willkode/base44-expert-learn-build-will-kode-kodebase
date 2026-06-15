import React from "react";
import { motion } from "framer-motion";
import {
  ScanLine,
  Database,
  LayoutDashboard,
  Building2,
  KeyRound,
  Sparkles,
  Image,
  CheckCircle2,
  CalendarClock,
  Rocket,
  MessageCircle,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  BarChart3,
  Lightbulb,
  CalendarDays,
  Settings2,
  Bell,
  FileClock,
  LifeBuoy,
  ClipboardCheck,
  Send,
  Workflow,
  ShieldCheck,
} from "lucide-react";

const phases = [
  {
    name: "Scan & Foundation",
    icon: ScanLine,
    prompts: [
      { n: "01", icon: ScanLine, title: "Full App Scan Before Building", desc: "Scans your existing app to understand its structure and add the system safely." },
      { n: "02", icon: Database, title: "Core Data Models", desc: "Foundational models for accounts, campaigns, and social media posts." },
      { n: "03", icon: LayoutDashboard, title: "Navigation & Dashboard Shell", desc: "UI shell, navigation links, and initial routes for the social dashboard." },
      { n: "04", icon: Building2, title: "Brand Profile & Campaign Setup", desc: "Setup flows for brand identity and marketing campaign configuration." },
    ],
  },
  {
    name: "Connect & Create",
    icon: Sparkles,
    prompts: [
      { n: "05", icon: KeyRound, title: "Platform OAuth Architecture", desc: "Secure backend architecture for connecting social media platform accounts." },
      { n: "06", icon: Sparkles, title: "AI Content Generation Engine", desc: "Generates platform-specific content using your brand and campaign data." },
      { n: "07", icon: Image, title: "AI Image Generation Workflow", desc: "An AI image generation workflow for social media posts." },
      { n: "08", icon: CheckCircle2, title: "Approval Workflow", desc: "A review workflow for AI-generated social media posts." },
    ],
  },
  {
    name: "Schedule & Publish",
    icon: CalendarClock,
    prompts: [
      { n: "09", icon: CalendarClock, title: "Posting Schedule System", desc: "Default posting times and manual scheduling for your queue." },
      { n: "10", icon: Rocket, title: "Auto-Posting Automation", desc: "Automation that publishes queued posts on schedule." },
      { n: "11", icon: MessageCircle, title: "Reddit Publishing Requirements", desc: "Subreddit-specific fields and rules for Reddit publishing." },
      { n: "12", icon: Linkedin, title: "LinkedIn Publishing Requirements", desc: "Publishing to personal profiles or organization pages on LinkedIn." },
      { n: "13", icon: Twitter, title: "X / Twitter Publishing Requirements", desc: "Platform-specific fields and validation for X/Twitter publishing." },
    ],
  },
  {
    name: "Per-Platform & Insights",
    icon: BarChart3,
    prompts: [
      { n: "14", icon: Facebook, title: "Facebook Publishing Requirements", desc: "A Facebook publishing workflow supporting Facebook Pages." },
      { n: "15", icon: Instagram, title: "Instagram Publishing Requirements", desc: "A visual-first Instagram workflow for professional accounts." },
      { n: "16", icon: BarChart3, title: "Analytics Collection System", desc: "Automation that syncs and stores performance metrics for posts." },
      { n: "17", icon: Lightbulb, title: "AI Performance Insights", desc: "AI that analyzes analytics and recommends content strategy improvements." },
      { n: "18", icon: CalendarDays, title: "Content Calendar Auto-Fill", desc: "Auto-fills the calendar by generating and scheduling campaign content." },
    ],
  },
  {
    name: "Safety & Launch",
    icon: ShieldCheck,
    prompts: [
      { n: "19", icon: Settings2, title: "Admin Settings & Limits", desc: "Admin settings and safety limits for the marketing system." },
      { n: "20", icon: Bell, title: "Notifications", desc: "Notifications for important social media automation events." },
      { n: "21", icon: FileClock, title: "Audit Logs & Compliance", desc: "Improved audit logging and compliance for the system." },
      { n: "22", icon: LifeBuoy, title: "Error Handling & Recovery", desc: "Robust error handling and recovery across the social media system." },
      { n: "23", icon: ClipboardCheck, title: "Final QA & Security Audit", desc: "A full QA pass and security audit of the completed system." },
      { n: "24", icon: Send, title: "Production Readiness Pass", desc: "A final readiness pass to prepare the system for real users." },
    ],
  },
];

const outcomes = [
  { icon: Database, title: "Complete data layer", desc: "Accounts, campaigns, posts, and brand profiles — modeled with strict admin-only access." },
  { icon: KeyRound, title: "Multi-platform connections", desc: "Secure OAuth architecture to connect Reddit, LinkedIn, X, Facebook, and Instagram accounts." },
  { icon: Sparkles, title: "AI content & images", desc: "Generate platform-specific copy and AI imagery from your brand and campaign data." },
  { icon: Workflow, title: "Approval & auto-posting", desc: "A review workflow plus scheduled auto-posting tuned to each platform's publishing rules." },
  { icon: BarChart3, title: "Analytics & AI insights", desc: "Synced performance metrics with AI recommendations to sharpen your content strategy." },
  { icon: ShieldCheck, title: "Safety & launch-ready", desc: "Admin limits, notifications, audit logs, error recovery, and a final security audit." },
];

export default function SocialMediaDetails() {
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
          24 sequential prompts: <span className="text-gradient-orange">scan → build → QA → production</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          You copy and paste each prompt into Base44 in order. The pack starts by scanning your existing app so it
          builds safely, then layers in the data models, admin dashboard, platform connections, AI content and image
          generation, approval, scheduling, per-platform publishing for Reddit, LinkedIn, X, Facebook and Instagram,
          analytics, and a final QA and production readiness pass — without breaking what you already have.
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
          A full <span className="text-gradient-orange">social media engine</span>, inside your own app
        </h2>
        <p className="text-lg text-muted-foreground">
          By the final prompt you own a complete, production-ready social media marketing system — no third-party
          scheduler, no recurring SaaS fees, fully integrated into your Base44 app.
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