import React from "react";
import { motion } from "framer-motion";
import { Smartphone, ShieldCheck, CreditCard, Scale, Eye, Bug, KeyRound, Boxes, CheckCircle2, XCircle } from "lucide-react";

const prompts = [
  { icon: Smartphone, title: "Master App Store Readiness Audit", desc: "Run this first. A full sweep of every page, route, form, and flow for the 15 most common mobile rejection causes — from broken layouts to gated routes that block reviewers." },
  { icon: CreditCard, title: "Stripe / Digital Purchase Compliance", desc: "The big one. Classifies every payment flow, disables non-compliant Stripe checkout in the mobile experience, and builds an entitlement system with admin feature flags." },
  { icon: Boxes, title: "App-Like Experience Upgrade", desc: "Beats Apple's 4.2 'thin website wrapper' rejection with mobile-first navigation, thumb-friendly buttons, and an app-style logged-in experience." },
  { icon: Scale, title: "Privacy Policy & Terms Access", desc: "Creates and links Privacy Policy, Terms, and support pages exactly where Apple and Google reviewers expect to find them — before signup." },
  { icon: Eye, title: "Reviewer Access / Demo Account", desc: "Builds a demo mode or reviewer path so app reviewers can test every core flow without getting blocked by paywalls or auth gates." },
  { icon: Bug, title: "Mobile Webview Bug Fix", desc: "Hunts down popups, new-tab links, iframe checkouts, keyboard-hidden forms, OAuth redirect issues, and everything else that breaks in a webview." },
  { icon: KeyRound, title: "Google Login / SHA-256 Checklist", desc: "A clear setup checklist for the Google Play App Signing SHA-256 fingerprint and OAuth callback behavior in the Android build." },
  { icon: ShieldCheck, title: "Native Wrapper Handoff Doc", desc: "When prompts aren't enough: a complete Capacitor handoff document covering StoreKit, Google Play Billing, push, and deep links." },
];

const canFix = [
  "Bad mobile layouts & broken buttons",
  "Missing privacy & terms pages",
  "Blocked reviewer access",
  "Thin 'repackaged website' feel",
  "Stripe checkout visibility issues",
  "Gated pages & unclear subscription states",
  "Mobile webview bugs",
];

const cannotFix = [
  "Native StoreKit / Google Play Billing",
  "Native push notifications",
  "Full offline mode",
  "Native background tasks & HealthKit",
  "Advanced device permissions",
  "Rejections caused by the wrapper itself",
];

export default function MobileApprovalKitDetails() {
  return (
    <div className="mt-24">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">The Prompt System</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
          8 prompts, run in <span className="text-gradient-orange">order.</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          Run Base44's mobile scan first, then work through the kit. Each prompt audits, fixes, and reports — so you know exactly what changed before you resubmit.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
        {prompts.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-sora font-semibold text-lg mb-1.5">
                  <span className="text-primary mr-1.5">{String(i + 1).padStart(2, "0")}</span>
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto mt-20 grid md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-card p-7">
          <h3 className="font-sora font-semibold text-xl mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" /> What these prompts fix
          </h3>
          <ul className="space-y-2.5">
            {canFix.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7">
          <h3 className="font-sora font-semibold text-xl mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-muted-foreground" /> What needs native code
          </h3>
          <ul className="space-y-2.5">
            {cannotFix.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <XCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            That's why the kit includes the Native Wrapper Handoff prompt — so you know exactly what to hand a native developer when the webview hits its limits.
          </p>
        </div>
      </div>
    </div>
  );
}