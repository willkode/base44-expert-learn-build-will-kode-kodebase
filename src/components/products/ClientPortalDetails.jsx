import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, FileCheck, MessageCircle, Milestone, Palette, Receipt, Users, Sparkles, CheckCircle2 } from "lucide-react";

const builds = [
  { icon: LayoutDashboard, title: "Branded client portal", desc: "A clean, professional portal where clients see live project status at a glance." },
  { icon: Milestone, title: "Milestone sign-offs", desc: "Structured approval gates so clients formally sign off at every project stage." },
  { icon: FileCheck, title: "File delivery & approvals", desc: "Organized deliverables with versioning, previews, and client approval workflow." },
  { icon: MessageCircle, title: "Feedback threads", desc: "Scoped feedback per deliverable — no more scattered emails and lost requests." },
  { icon: Receipt, title: "Invoicing view", desc: "Clients see invoices, payment status, and history right inside the portal." },
  { icon: Palette, title: "White-label mode", desc: "Rebrand the entire portal so agencies can resell it under their own name." },
];

const outcomes = [
  "Stop answering 'what's the status?' emails forever",
  "Get formal client sign-off at every milestone",
  "Deliver files professionally with approval tracking",
  "Keep all feedback organized per deliverable",
  "Look like a bigger operation than you are",
  "Resell the same portal to your own clients",
];

const audience = [
  "Vibe coders delivering client projects",
  "Freelancers who want to look enterprise-grade",
  "Agencies managing multiple client relationships",
  "Business OS owners completing their client-facing side",
];

export default function ClientPortalDetails() {
  return (
    <section className="max-w-5xl mx-auto mt-24">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">What It Builds</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          The <span className="text-gradient-orange">client-facing half</span> of your business
        </h2>
        <p className="text-lg text-muted-foreground">
          The Vibe Coding Business OS runs your internal operations. This system builds what your clients see — a
          branded portal with project status, file delivery, milestone approvals, feedback, and invoicing. Plus a
          white-label mode so you can resell it.
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
        <h3 className="font-sora font-bold text-xl mb-6 text-center">What changes for your business</h3>
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
          Built for <span className="text-gradient-orange">professional delivery</span>
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
          Deliver like an <span className="text-gradient-orange">agency</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Clients judge you by the delivery experience, not just the work. This system makes every project feel
          organized, transparent, and premium — and gives you a whole new product to resell.
        </p>
      </motion.div>
    </section>
  );
}