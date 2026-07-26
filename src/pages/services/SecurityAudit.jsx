import React, { useState, useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { faqSchema } from "@/lib/seo";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Lock, ArrowRight, CheckCircle, ChevronDown, ChevronUp,
  Clock, FileText, Zap, Users, Database, Eye, TrendingUp,
  PenSquare, Key, AlertTriangle, Server, ShieldOff, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ServiceCheckoutButton from "@/components/services/ServiceCheckoutButton";
import { trackEvent } from "@/lib/analytics";
import ReviewsSection from "@/components/reviews/ReviewsSection";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

const attackSurfaces = [
  { icon: Users, label: "Role Enforcement", desc: "Admin, user, and custom role checks" },
  { icon: Database, label: "Entity Access Rules", desc: "RLS and data-level permissions" },
  { icon: Eye, label: "Public Data Exposure", desc: "Sensitive data visible to wrong users" },
  { icon: TrendingUp, label: "Privilege Escalation", desc: "Users gaining unauthorized access" },
  { icon: PenSquare, label: "Unsafe Writes", desc: "Unprotected create/update/delete operations" },
  { icon: Key, label: "Weak Ownership Rules", desc: "Records accessible across tenants" },
  { icon: AlertTriangle, label: "Admin Exposure", desc: "Admin-only functions callable by users" },
  { icon: Server, label: "Insecure Functions", desc: "Backend functions without proper auth" },
];

const bestFit = [
  "Apps with users",
  "Apps with admin roles",
  "Apps storing customer data",
  "Internal tools with sensitive data",
  "Builders getting ready to launch",
  "Apps handling payments or PII",
];

const plans = [
  {
    title: "Security Audit",
    subtitle: "Report + fix prompts",
    price: "$50",
    billing: "one-time",
    badge: null,
    features: [
      "RLS & permission review",
      "Auth flow analysis",
      "Data exposure check",
      "Vulnerability report",
      "Copy-paste fix prompts",
    ],
    cta: "Get Security Audit",
    serviceId: "security_audit",
  },
  {
    title: "Security Audit + Fix",
    subtitle: "Report + remediation",
    price: "$62.50",
    originalPrice: "$125",
    billing: "one-time",
    badge: "50% OFF",
    features: [
      "Everything in Security Audit",
      "All vulnerabilities patched",
      "RLS rules fixed",
      "Verified secure after fix",
    ],
    cta: "Get Audit + Fix",
    serviceId: "security_audit_fix",
  },
];

const steps = [
  { num: "01", title: "Choose your package", desc: "Security Audit or Audit + Fix." },
  { num: "02", title: "Complete intake", desc: "Share your app URL, roles, and security concerns." },
  { num: "03", title: "Pay", desc: "Quick checkout via Stripe." },
  { num: "04", title: "Optional access", desc: "Provide login (or work from screenshots & URL)." },
  { num: "05", title: "Review starts", desc: "Security-focused analysis begins immediately." },
  { num: "06", title: "Receive findings", desc: "Severity-ranked report with fix prompts in 24–48hrs." },
];

const faqs = [
  { q: "Is this different from ER Service?", a: "Yes. The ER Service is a general app audit covering UX, bugs, architecture, and performance. This is a security-specific review focused on auth, RLS, role enforcement, data exposure, and backend function safety." },
  { q: "What security issues do you look for?", a: "The eight critical attack surfaces listed above — role enforcement, entity access rules, public data exposure, privilege escalation, unsafe writes, weak ownership, admin exposure, and insecure backend functions." },
  { q: "Do I need to provide login access?", a: "It's optional but recommended. With login access I can verify role-based flows directly. Without it, I work from your app URL, screenshots, and the intake form details." },
  { q: "Can I buy the audit now and fixes later?", a: "Absolutely. Start with Security Audit to get the full findings, then bring in a Kode Session or Hire Me to implement the fixes when you're ready." },
  { q: "Will this help before launch?", a: "Yes — it's one of the best times to run it. Catching auth and RLS issues before real users hit your app is far cheaper than patching after a data exposure." },
];

const freeTools = [
  { label: "Free KodeAudit", desc: "AI security & code scanner", to: "/tools/blueprint" },
  { label: "Free Sentinel monitoring", desc: "Real-time security alerts", to: "/services/sentinel-pro" },
];

export default function SecurityAudit() {
  useEffect(() => {
    trackEvent("page_view", { page: "security_audit_service" });
  }, []);

  const handleCTA = (label) => {
    trackEvent("service_cta_click", { service: "security_audit", cta: label });
  };

  return (
    <>
      <Seo
        title="Security Audit + Fix — Lock Down Your Base44 App Before Launch | KodeBase"
        description="A focused security review of your auth, RLS rules, role enforcement, and data exposure. Get vulnerabilities found and fixed in 24–48 hours with copy-paste fix prompts."
        path="/services/security-audit"
        image="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c4571791e_generated_image.png"
        jsonLd={[faqSchema(faqs)]}
      />
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Security-Focused Audit · 24–48hr Turnaround</span>
            </div>
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="font-sora font-extrabold text-4xl md:text-6xl tracking-tight mb-4"
          >
            Lock down your app<br />
            <span className="text-gradient-orange">before it's too late.</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            A focused security review of your auth, RLS rules, role enforcement, and data exposure — with prompts (or fixes) to seal every gap.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {[
              { icon: Lock, label: "RLS & permissions" },
              { icon: Key, label: "Auth & role checks" },
              { icon: Server, label: "Backend function review" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </div>
            ))}
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="flex flex-wrap items-center justify-center gap-3">
            <a href="#pricing" onClick={() => handleCTA("hero_primary")}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
                Lock Down My App <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Attack surfaces */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What this covers</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">Eight critical attack surfaces.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every common security failure pattern in vibe-coded apps — checked, documented, and fixable.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {attackSurfaces.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.4}
                className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border border-border bg-card/60 hover:border-primary/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best fit */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Best fit</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">Built for apps with stakes.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {bestFit.map((item, i) => (
              <motion.div
                key={item}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.4}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/60"
              >
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Pricing</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">Two ways to lock it down.</h2>
            <p className="text-muted-foreground">Pay once. Get a security report (or a hardened app) within 24–48 hours.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className={`relative rounded-2xl border p-8 flex flex-col ${plan.badge ? "border-primary bg-primary/5 glow-orange" : "border-border bg-card/60"}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</span>
                  </div>
                )}
                <h3 className="font-sora font-bold text-xl mb-1">{plan.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.subtitle}</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="font-sora font-extrabold text-4xl text-foreground">{plan.price}</span>
                  {plan.originalPrice && (
                    <span className="text-muted-foreground/60 text-lg line-through">{plan.originalPrice}</span>
                  )}
                  <span className="text-muted-foreground text-sm">{plan.billing}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <ServiceCheckoutButton
                  serviceId={plan.serviceId}
                  label={plan.cta}
                  onClick={() => handleCTA(plan.title)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">How it works</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">From order to hardened app.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.4}
                className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card/60"
              >
                <span className="font-sora font-extrabold text-2xl text-gradient-orange shrink-0">{step.num}</span>
                <div>
                  <p className="font-semibold text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection seed="service:security-audit" title="What clients say about the Security Audit" />

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">FAQ</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQ key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Free tools */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Free tools</p>
            <h2 className="font-sora font-extrabold text-3xl tracking-tight">Want to scan for free first?</h2>
            <p className="text-muted-foreground mt-2">Run a quick check yourself before booking a paid audit.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {freeTools.map((tool) => (
              <motion.div
                key={tool.label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="rounded-2xl border border-border bg-card/60 p-6 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2">
                  <ShieldOff className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">{tool.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{tool.desc}</p>
                <Link to={tool.to}>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleCTA(tool.label)}>
                    Try Free <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Keep exploring */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Keep exploring</p>
            <h2 className="font-sora font-extrabold text-3xl tracking-tight">Going beyond a one-time audit</h2>
            <p className="text-muted-foreground mt-2">For apps with real users, security is ongoing — not a checkbox.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { tag: "Continuous monitoring", title: "Sentinel Pro", desc: "Premium monitoring setup plus security hardening for serious apps.", to: "/services/sentinel-pro", cta: "Learn more" },
              { tag: "General review", title: "ER Service", desc: "Already secure? Get a full app review for bugs, UI, and architecture.", to: "/services/er-service", cta: "Learn more" },
              { tag: "Custom hardening", title: "Hire Me", desc: "Deeper rebuilds, refactors, and custom security work.", to: "/contact", cta: "Learn more" },
            ].map((card) => (
              <motion.div
                key={card.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="rounded-2xl border border-border bg-card/60 p-6 flex flex-col"
              >
                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{card.tag}</span>
                <h3 className="font-sora font-bold text-xl mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground flex-1 mb-4">{card.desc}</p>
                <Link to={card.to}>
                  <Button variant="outline" size="sm" className="w-full">{card.cta} <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">
            Lock down your app before problems grow.
          </h2>
          <ServiceCheckoutButton
            serviceId="security_audit"
            label="Get Security Audit"
            className="px-10 inline-flex w-auto"
            onClick={() => handleCTA("final_cta")}
          />
        </div>
      </section>
    </>
  );
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left border border-border rounded-xl p-5 hover:border-primary/40 transition-colors bg-card/60"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-foreground">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>
      {open && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </button>
  );
}