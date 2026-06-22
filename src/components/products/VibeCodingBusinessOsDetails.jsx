import React from "react";
import { motion } from "framer-motion";
import {
  Users, PhoneCall, FileText, FileSignature, Receipt, FolderKanban,
  ListChecks, Wand2, Bug, ShieldCheck, LayoutDashboard, GitPullRequest,
  LifeBuoy, MessageSquare, FolderOpen, BookOpen, Package, PlusCircle,
  Clock, BarChart3, CheckCircle2, Sunrise, Sun, Sunset, Moon,
} from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.05 } }),
};

const systems = [
  { icon: Users, name: "Lead CRM", desc: "Track every potential client with a full sales pipeline — from new lead to won or lost — so you never lose an opportunity again." },
  { icon: PhoneCall, name: "Discovery Call System", desc: "A structured way to understand the client before you build, generating a project brief that becomes the foundation for your prompts." },
  { icon: FileText, name: "Proposal / Quote System", desc: "Create professional quotes with scope, deliverables, timeline, pricing, and statuses — package work cleanly every time." },
  { icon: FileSignature, name: "Contract / Agreement System", desc: "A simple agreement workflow with status tracking to lock down scope, payment terms, ownership, and revision limits." },
  { icon: Receipt, name: "Invoicing System", desc: "Bill clients professionally and always know who owes money, what's paid, what's overdue, and which projects can start." },
  { icon: FolderKanban, name: "Project Management", desc: "Your command center — every client project with status, phase, progress, deliverables, and linked invoices and tickets." },
  { icon: ListChecks, name: "Task Management", desc: "Break AI builds into manageable pieces with tasks, priorities, due dates, and client-visible vs internal-only flags." },
  { icon: Wand2, name: "Prompt Management", desc: "Store prompts by project and use case. Track what worked, what failed, and what can be reused — the AI-agency differentiator." },
  { icon: Bug, name: "QA / Testing System", desc: "A QA checklist for every project covering auth, roles, forms, mobile, states, and route protection — so nothing breaks under use." },
  { icon: ShieldCheck, name: "Security Review System", desc: "A security checklist before client handoff: protected routes, data isolation, role permissions, and exposed entities." },
  { icon: LayoutDashboard, name: "Client Portal", desc: "A client-facing area to check project status, deliverables, files, messages, and approvals — without blowing up your inbox." },
  { icon: GitPullRequest, name: "Change Request System", desc: "Control scope creep professionally. Track requests, decide what's in scope vs billable, and approve or decline cleanly." },
  { icon: LifeBuoy, name: "Support Ticket System", desc: "Handle post-delivery help with typed, prioritized tickets — and set up monthly support retainers." },
  { icon: MessageSquare, name: "Communication Log", desc: "A record of every important client conversation, action item, and follow-up so nothing gets lost in translation." },
  { icon: FolderOpen, name: "File / Asset Management", desc: "Track logos, brand guidelines, exports, contracts, and handoff docs with metadata and links — even if stored elsewhere." },
  { icon: BookOpen, name: "Knowledge Base", desc: "Internal documentation for discovery, quoting, testing, delivery, and platform tips — ready for when you grow a team." },
  { icon: Package, name: "Service Package Manager", desc: "Predefined offers with deliverables, pricing, timelines, and revision limits so you sell consistently every time." },
  { icon: PlusCircle, name: "Add-On / Upsell System", desc: "Track optional add-ons — SEO, CRM, portals, automation, audits — to increase the value of every project." },
  { icon: Clock, name: "Time Tracking System", desc: "Know how long work actually takes, by project and work type, so you can price flat-rate work better over time." },
  { icon: BarChart3, name: "Financial Dashboard", desc: "Real business visibility: revenue, outstanding & overdue invoices, MRR, conversion rate, and revenue by package or client." },
];

const mvp = [
  "CRM", "Clients", "Projects", "Tasks", "Invoices",
  "Support tickets", "Prompt library", "QA checklist", "Client portal", "Admin dashboard",
];

const advanced = [
  "Proposal generator", "Contract tracking", "Time tracking", "Financial reports",
  "AI project brief generator", "AI proposal writer", "AI prompt generator",
  "AI QA reviewer", "AI support reply assistant", "Stripe / Square payments",
  "Email notifications", "Client approval workflows", "Monthly retainer tracking",
];

const dayFlow = [
  {
    icon: Sunrise, title: "Morning",
    items: ["Check dashboard", "Review due tasks & deadlines", "Check new leads", "Check unpaid invoices", "Check support tickets", "Follow up with prospects"],
  },
  {
    icon: Sun, title: "Midday",
    items: ["Work on active project tasks", "Run prompts / build features", "Test completed work", "Update project status", "Log notes", "Send client updates"],
  },
  {
    icon: Sunset, title: "Afternoon",
    items: ["Handle revisions", "Respond to tickets", "Send proposals", "Send invoices", "Update CRM", "Plan next day's tasks"],
  },
  {
    icon: Moon, title: "End of Day",
    items: ["Update project progress", "Log time", "Mark blockers", "Send status updates", "Review tomorrow's priorities"],
  },
];

export default function VibeCodingBusinessOsDetails() {
  return (
    <section className="max-w-5xl mx-auto mt-24">
      {/* The difference */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}
        className="text-center max-w-3xl mx-auto"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">The Difference</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-6">
          Anyone can say <span className="text-muted-foreground">"I can build with AI."</span><br />
          Few can say <span className="text-gradient-orange">"I can run a real client service business."</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Vibe coding services need more than prompts. They need a full daily operations system to manage leads,
          clients, projects, invoices, support, revisions, files, and delivery. You build your own internal system
          first — then reuse that same model for clients.
        </p>
      </motion.div>

      {/* The 20 core systems */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}
        className="text-center max-w-3xl mx-auto mt-24"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">What You Build</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          20 core systems, <span className="text-gradient-orange">one Business OS</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Every module a vibe coding business needs to sell, manage, deliver, invoice, support, and scale —
          built step by step in the workshop.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-5 mt-12">
        {systems.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.name}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i % 4}
              className="rounded-2xl border border-border bg-card/60 p-6 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f87171] via-[#fb923c] to-[#facc15] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#0a0f1e]" />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-sora font-bold text-lg text-muted-foreground/30 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-sora font-semibold text-base leading-tight">{s.name}</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* MVP vs Advanced */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}
        className="text-center max-w-3xl mx-auto mt-24"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Build Path</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          Start tight, then <span className="text-gradient-orange">scale up</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Ship a focused MVP that's enough to run the business — then layer in the advanced, AI-powered modules as you grow.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8">
          <h3 className="font-sora font-bold text-xl mb-1">MVP Version</h3>
          <p className="text-sm text-muted-foreground mb-5">Enough to run the business from day one.</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {mvp.map((m) => (
              <li key={m} className="flex items-center gap-2.5 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {m}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-8">
          <h3 className="font-sora font-bold text-xl mb-1">Advanced Version</h3>
          <p className="text-sm text-muted-foreground mb-5">Add these as you scale into a real operation.</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {advanced.map((a) => (
              <li key={a} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Daily operations flow */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}
        className="text-center max-w-3xl mx-auto mt-24"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Daily Operations</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          A repeatable <span className="text-gradient-orange">operating rhythm</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          The Business OS isn't just screens — it's a daily flow that keeps leads, builds, billing, and support moving.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
        {dayFlow.map((block, i) => {
          const Icon = block.icon;
          return (
            <motion.div
              key={block.title}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-sora font-semibold text-base mb-3">{block.title}</h4>
              <ul className="space-y-2">
                {block.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Positioning */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}
        className="mt-24 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-amber-500/5 p-10 text-center"
      >
        <h2 className="font-sora font-bold text-2xl md:text-3xl tracking-tight mb-4">
          This isn't "learn prompts."
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          It's <span className="text-foreground font-semibold">build the system that runs your vibe coding career.</span> Build
          it for yourself first — then turn around and sell similar systems to businesses.
        </p>
      </motion.div>
    </section>
  );
}