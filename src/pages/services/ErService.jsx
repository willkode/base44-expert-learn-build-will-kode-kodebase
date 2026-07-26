import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { faqSchema } from "@/lib/seo";
import {
  AlertTriangle, FileSearch, FileText, Zap, Layers, ArrowRight,
  CheckCircle, ChevronDown, ChevronUp, MousePointerClick, Layout,
  Sparkles, GitBranch, Lock, Gauge, Code2, Trash2, ShieldCheck,
  Bug, Smartphone, Monitor, Clock, ClipboardList, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ServiceCheckoutButton from "@/components/services/ServiceCheckoutButton";
import { trackEvent } from "@/lib/analytics";
import ReviewsSection from "@/components/reviews/ReviewsSection";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

const included = [
  { icon: FileSearch, label: "App Review", desc: "Complete walkthrough of your entire app", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/ac996ceed_generated_image.png" },
  { icon: AlertTriangle, label: "Issue Discovery", desc: "Every bug and problem identified", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/fe85d6aef_generated_image.png" },
  { icon: FileText, label: "Written Report", desc: "Detailed findings grouped by priority", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/f9b36e264_generated_image.png" },
  { icon: Zap, label: "Fix Prompts", desc: "Copy-paste prompts to fix every issue", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/82a98428d_generated_image.png" },
  { icon: Layers, label: "Grouped Findings", desc: "Issues organized by category and severity", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/da7523819_generated_image.png" },
  { icon: ArrowRight, label: "Next Steps", desc: "Recommended action plan", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/f79ccb56b_generated_image.png" },
];

const inspection = [
  { label: "Broken Flows", desc: "Buttons, forms, and navigation that don't work", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c9f5fbea1_generated_image.png" },
  { label: "UI & Layout Issues", desc: "Visual bugs, responsiveness, and design problems", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a25cbc84f_generated_image.png" },
  { label: "Prompt Problems", desc: "AI prompts producing bad or inconsistent results", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/048b31608_generated_image.png" },
  { label: "Poor App Structure", desc: "Messy code, missing components, bad architecture", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/5b072866c_generated_image.png" },
  { label: "Logic Errors", desc: "Conditions and workflows that produce wrong results", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/0ba4f7055_generated_image.png" },
  { label: "Workflow Gaps", desc: "Missing steps or incomplete user flows", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/5cf06b243_generated_image.png" },
  { label: "Permissions Issues", desc: "RLS rules and access control problems", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/81e7c0a82_generated_image.png" },
  { label: "Performance Concerns", desc: "Slow loading, redundant queries, heavy pages", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a25cc6ec3_generated_image.png" },
  { label: "Code Quality Scan", desc: "Anti-patterns, unused code, and maintainability issues", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/906fdf0b7_generated_image.png" },
  { label: "Codebase Cleanup", desc: "Bloat, dead code, redundant logic, and lean optimization", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/ee555eca6_generated_image.png" },
  { label: "RLS Audit", desc: "Row Level Security rules, access control, and permissions", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/b39b856f8_generated_image.png" },
  { label: "Error Logging & Debugging", desc: "Silent failures, runtime errors, and error tracing", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/6f9075a4b_generated_image.png" },
  { label: "Mobile Optimization", desc: "Responsiveness, touch targets, and layout breakpoints", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/61cce5878_generated_image.png" },
  { label: "Desktop UI Review", desc: "Layout, spacing, visual hierarchy, and design consistency", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/8e150ec8a_generated_image.png" },
];

const plans = [
  {
    title: "Audit Only",
    subtitle: "Report + fix prompts",
    price: "$20",
    originalPrice: "$50",
    billing: "one-time",
    badge: "SPECIAL — 60% OFF",
    features: [
      "Complete 14-point app review",
      "All issues identified",
      "Detailed written report",
      "Copy-paste fix prompts",
      "Recommended next steps",
    ],
    cta: "Get the Audit",
    serviceId: "er_audit",
  },
  {
    title: "Audit + Fix",
    subtitle: "Report + direct fix implementation",
    price: "$62.50",
    originalPrice: "$125",
    billing: "one-time",
    badge: "50% OFF",
    features: [
      "Everything in Audit Only",
      "Will fixes all issues found",
      "Same-day turnaround",
      "Verified working after fix",
    ],
    cta: "Get Audit + Fix",
    serviceId: "er_audit_fix",
  },
];

const steps = [
  { num: "01", title: "Choose your package", desc: "Audit Only or Audit + Fix." },
  { num: "02", title: "Enter your details", desc: "Name, email, and your app URL — no signup needed." },
  { num: "03", title: "Pay securely", desc: "Quick one-time checkout via Square." },
  { num: "04", title: "Add me as collaborator", desc: "Invite iamwillkode@gmail.com to your app so I can scan it." },
  { num: "05", title: "Audit begins", desc: "I review your app and identify all issues." },
  { num: "06", title: "Get your report", desc: "Findings + fix prompts delivered in 24–48hrs." },
];

const faqs = [
  { q: "What kinds of apps do you audit?", a: "Primarily Base44 apps, but also custom React apps and anything running in a browser. If you can share your screen or give me access, I can audit it." },
  { q: "Do you need login access?", a: "For most audits, yes — I'll need to walk through your app as different user roles to spot access control issues and broken flows. Credentials are handled securely via the intake form." },
  { q: "What if I only want the report?", a: "That's exactly what Audit Only is. You get the full written report and copy-paste fix prompts — no implementation. You apply the fixes yourself in your own time." },
  { q: "What if I want the fixes later?", a: "No problem. Start with Audit Only and upgrade to fix work (via a Kode Session or Hire Me) after you've reviewed the report." },
  { q: "How do I receive the report?", a: "The written report is delivered via email within 24–48 hours of the audit starting. It includes findings grouped by priority, severity, and category — each with a copy-paste fix prompt." },
];

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

export default function ErService() {
  useEffect(() => {
    trackEvent("page_view", { page: "er_service" });
  }, []);

  const handleCTA = (label) => {
    trackEvent("service_cta_click", { service: "er_service", cta: label });
  };

  return (
    <>
      <Seo
        title="$20 Emergency App Audit — Find Every Bug in 24–48 Hours | KodeBase"
        description="Limited-time special: a complete 14-point Base44 app audit with a written report and copy-paste fix prompts for just $20 — delivered in 24–48 hours."
        path="/services/er-service"
        image="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/49ee2fc44_generated_image.png"
        jsonLd={[faqSchema(faqs)]}
      />
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <AlertTriangle className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Special: $20 Audit + Report · 24–48hr Turnaround</span>
            </div>
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="font-sora font-extrabold text-4xl md:text-6xl tracking-tight mb-4"
          >
            Your app's broken.<br />
            <span className="text-gradient-orange">We'll find every issue.</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            A complete app audit with a written report and copy-paste fix prompts. Add direct fixes for fastest recovery.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {[
              { icon: Clock, label: "24–48hr delivery" },
              { icon: ClipboardList, label: "14-point inspection" },
              { icon: Zap, label: "Copy-paste fix prompts" },
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
                Get the Audit <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What's included</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">Complete report. Real fixes.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every issue identified, prioritized, and paired with a fix prompt you can use right away.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {included.map(({ icon: Icon, label, desc, image }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}
                className="flex flex-col rounded-2xl border border-border bg-card/60 hover:border-primary/40 transition-colors overflow-hidden group"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={image} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-primary/15 backdrop-blur-sm flex items-center justify-center border border-primary/30">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="p-5 text-center">
                  <p className="font-semibold text-sm text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 14-point inspection */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">14-point inspection</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">What I check.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A thorough sweep across UX, code, security, and performance — nothing slips through.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspection.map(({ label, desc, image }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3}
                className="flex items-stretch rounded-xl border border-border bg-card/60 hover:border-primary/40 transition-colors overflow-hidden group"
              >
                <div className="relative w-28 sm:w-32 shrink-0 overflow-hidden">
                  <img src={image} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80" />
                </div>
                <div className="flex flex-col justify-center p-4 flex-1">
                  <p className="font-semibold text-sm text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
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
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">Two ways to get unstuck.</h2>
            <p className="text-muted-foreground">Pay once. Get clarity (or a working app) within 24–48 hours.</p>
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
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">From order to report.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}
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

      <ReviewsSection seed="service:er-service" title="What clients say about the ER Service" />

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

      {/* Keep exploring */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Keep exploring</p>
            <h2 className="font-sora font-extrabold text-3xl tracking-tight">After the audit — what's next?</h2>
            <p className="text-muted-foreground mt-2">Most apps need more than a one-time fix. Here's what comes after.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { tag: "Security focus", title: "Security Audit + Fix", desc: "Lock down auth, RLS rules, and data exposure after the general audit.", to: "/services/security-audit", cta: "Learn more" },
              { tag: "Custom work", title: "Hire Me", desc: "Need bigger fixes or a rebuild? Get a full custom-project quote.", to: "/contact", cta: "Learn more" },
              { tag: "Ongoing care", title: "KodeCare", desc: "Avoid future emergencies with a monthly support retainer.", to: "/services/kodecare", cta: "Learn more" },
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
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">
            Need a second set of expert eyes on your app?
          </h2>
          <ServiceCheckoutButton
            serviceId="er_audit"
            label="Get the Audit"
            className="px-10 inline-flex w-auto"
            onClick={() => handleCTA("final_cta")}
          />
        </div>
      </section>
    </>
  );
}