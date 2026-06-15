import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Database,
  LayoutDashboard,
  ScanLine,
  ListChecks,
  Route as RouteIcon,
  Box,
  Users,
  FileSearch,
  Wrench,
  RefreshCw,
  FileText,
  Bell,
  Siren,
  ClipboardCheck,
  Copy,
  Lock,
  AlertTriangle,
  Gauge,
} from "lucide-react";

const phases = [
  {
    name: "Foundation & Registry",
    icon: Database,
    prompts: [
      { n: "01", icon: ShieldCheck, title: "Install the Security Foundation", desc: "Creates an admin-only /admin/security command center plus the SecurityScan, SecurityIssue, SecurityCheck, SecuritySetting & SecurityRegistry data models." },
      { n: "02", icon: LayoutDashboard, title: "Build the Registry Scanner", desc: "Admin UI to inventory routes, entities, roles, and dangerous actions — with auto-generate and completeness-review helpers." },
    ],
  },
  {
    name: "The Scan Engine",
    icon: ScanLine,
    prompts: [
      { n: "03", icon: ScanLine, title: "Add the Scan Now Engine", desc: "One click runs registry-based checks, generates issues with copy/paste fix prompts, and calculates a 0–100 security score." },
      { n: "04", icon: RouteIcon, title: "Route Protection Detection", desc: "Flags public admin routes, exposed dashboards, and sensitive paths missing the right access level." },
      { n: "05", icon: Box, title: "Entity / API Exposure Detection", desc: "Catches sensitive entities that are public-readable, public-writable, or missing owner scope." },
      { n: "06", icon: Users, title: "Role & Data Isolation Detection", desc: "Finds privilege-escalation risks and user data that could leak across accounts." },
    ],
  },
  {
    name: "Fix, Retest & Report",
    icon: Wrench,
    prompts: [
      { n: "07", icon: FileSearch, title: "Issue Detail & Copy Fix Prompt", desc: "A professional issues table, detail drawer, status workflow, and one-click copy-fix-prompt feature." },
      { n: "08", icon: RefreshCw, title: "Retest Workflow", desc: "Retest a single issue or every open issue, with category-based manual checklists and resolved tracking." },
      { n: "09", icon: FileText, title: "Security Report Generator", desc: "Client-ready, print- and copy-friendly audit report with executive summary, fix order, and disclaimers." },
    ],
  },
  {
    name: "Alerts & Launch",
    icon: Siren,
    prompts: [
      { n: "10", icon: Bell, title: "Notifications & Critical Alerts", desc: "In-app notifications and score-based banners for scans, critical/high issues, and dropping scores." },
      { n: "11", icon: Siren, title: "Emergency Lockdown Mode", desc: "A fast-response review that prioritizes urgent risks and generates emergency fix prompts — without breaking your app." },
      { n: "12", icon: ClipboardCheck, title: "Final QA & Regression Test", desc: "A complete QA pass confirming nothing existing was broken and the whole module is production-ready." },
    ],
  },
];

const checks = [
  { icon: RouteIcon, title: "Route Protection", desc: "Public admin routes, exposed dashboards, and sensitive paths without the right access level." },
  { icon: Box, title: "Entity Exposure", desc: "Sensitive entities that are public-readable, public-writable, or missing owner scope." },
  { icon: Users, title: "Role-Based Access", desc: "Non-admin roles with admin powers, missing admin roles, and dangerous actions on weak roles." },
  { icon: Lock, title: "User Data Isolation", desc: "Records that could leak between users and shared data missing role restrictions." },
  { icon: AlertTriangle, title: "Dangerous Actions", desc: "Delete, export, billing, and role-change actions that don't require the correct permission." },
  { icon: ShieldCheck, title: "Admin Lockdown", desc: "Admin areas and the security dashboard itself verified as admin-only." },
];

const outcomes = [
  { icon: Gauge, title: "A live security score", desc: "Every scan produces a 0–100 score with a clear label — from Critical Risk to Launch Ready." },
  { icon: Copy, title: "Copy/paste fix prompts", desc: "Each issue ships with a ready-to-run fix prompt you paste straight back into Base44." },
  { icon: RefreshCw, title: "Scan → fix → retest loop", desc: "The highest-value workflow: scan, review, copy fix, apply, retest, and report." },
  { icon: FileText, title: "Client-ready reports", desc: "Generate professional, print-friendly audit reports for launches or client delivery." },
  { icon: Siren, title: "Emergency Lockdown mode", desc: "Prioritize urgent exposure risks fast, with guided emergency fix prompts." },
  { icon: ShieldCheck, title: "Admin-only & non-destructive", desc: "Everything is gated to admins and added as a new module — your existing app stays untouched." },
];

export default function SecurityLockdownDetails() {
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
          12 staged prompts: <span className="text-gradient-orange">scan → harden → retest → report</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          You copy and paste each prompt into Base44 in order. The pack starts by installing an admin-only security
          command center, then layers in the registry, scan engine, issue detection, copy/paste fix prompts, retesting,
          reports, alerts, emergency lockdown, and a final QA pass — built to harden your app without breaking what you
          already have.
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

      {/* What it scans for */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mt-24"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">What It Scans For</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          Six categories of <span className="text-gradient-orange">real-world risk</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          The scanner reviews your configured registry and known access patterns to surface the security gaps that
          actually get apps in trouble before launch or client delivery.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        {checks.map((item, i) => {
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
          A full <span className="text-gradient-orange">security command center</span>, inside your own app
        </h2>
        <p className="text-lg text-muted-foreground">
          By the final prompt you own a complete, admin-only security dashboard with a scan engine, issue tracking,
          copy/paste fix prompts, retesting, reports, and alerts — productized to test, harden, and ship Base44 apps with
          confidence.
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

      {/* Honesty note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-16 rounded-2xl border border-border bg-card/60 p-6 flex items-start gap-4 max-w-3xl mx-auto"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <ListChecks className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This is a practical, registry-based, app-level security system. It helps you identify and fix likely access
          control, route, entity, role, and data-isolation risks — and is meant to be paired with manual testing using
          logged-out, regular-user, premium, and admin accounts. It does not replace a full third-party penetration test
          or compliance audit.
        </p>
      </motion.div>
    </section>
  );
}