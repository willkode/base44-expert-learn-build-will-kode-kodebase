import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { faqSchema } from "@/lib/seo";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Monitor, Shield, ArrowRight, CheckCircle, Clock, Bell,
  Activity, Server, Lock, Eye, TrendingUp, AlertTriangle, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ServiceCheckoutButton from "@/components/services/ServiceCheckoutButton";
import ServiceFAQ from "@/components/services/ServiceFAQ";
import { trackEvent } from "@/lib/analytics";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

const monitoringAreas = [
  { icon: Lock, label: "Auth & RLS Monitoring", desc: "Continuous checks on role enforcement and data access rules" },
  { icon: Bell, label: "Real-Time Security Alerts", desc: "Instant notifications when vulnerabilities surface" },
  { icon: Activity, label: "Uptime & Performance", desc: "Page load tracking, API health, and Core Web Vitals" },
  { icon: Server, label: "Backend Function Safety", desc: "Monitoring exposed endpoints and admin-only functions" },
  { icon: Eye, label: "Data Exposure Watch", desc: "Detecting public data leaks before they become incidents" },
  { icon: TrendingUp, label: "Privilege Escalation Checks", desc: "Alerts when user roles change or escalate unexpectedly" },
  { icon: AlertTriangle, label: "Threat Detection", desc: "Pattern-based detection of suspicious activity" },
  { icon: Zap, label: "Incident Response", desc: "Fast turnaround fixes when issues are detected" },
];

const bestFit = [
  "Apps with real paying users",
  "SaaS products handling payments or PII",
  "Marketplace apps with multiple user roles",
  "Internal tools with sensitive company data",
  "Apps that can't afford downtime",
  "Builders who want peace of mind",
  "Apps that have already had a security audit",
  "Apps preparing to scale",
];

const plans = [
  {
    title: "Sentinel Pro Setup",
    subtitle: "Monitoring setup + security hardening",
    price: "$50",
    billing: "one-time",
    badge: null,
    features: [
      "Security hardening pass",
      "Monitoring infrastructure setup",
      "Alert routing configuration",
      "Initial vulnerability scan",
      "RLS & permission review",
      "30-day monitoring included",
      "Summary report at day 30",
    ],
    cta: "Get Sentinel Pro Setup",
    serviceId: "sentinel_pro_setup",
  },
  {
    title: "Sentinel Pro Monthly",
    subtitle: "Ongoing monitoring retainer",
    price: "$150/mo",
    billing: "monthly",
    badge: "Recommended",
    features: [
      "Everything in Sentinel Pro Setup",
      "Continuous 24/7 monitoring",
      "Real-time security alerts",
      "Uptime & performance tracking",
      "Monthly security & performance report",
      "Priority incident response",
      "Monthly hardening updates",
      "Direct access for escalations",
    ],
    cta: "Start Monthly Monitoring",
    serviceId: "sentinel_pro_monthly",
  },
];

const steps = [
  { num: "01", title: "Choose your plan", desc: "One-time setup or ongoing monthly monitoring retainer." },
  { num: "02", title: "Complete intake", desc: "Share your app URL, roles, and any known security concerns." },
  { num: "03", title: "Pay & onboard", desc: "Quick checkout, then I set up monitoring infrastructure." },
  { num: "04", title: "Security hardening", desc: "I run a hardening pass on your auth, RLS, and backend functions." },
  { num: "05", title: "Monitoring begins", desc: "Alerts are configured and routing is set up for your team." },
  { num: "06", title: "Stay protected", desc: "Continuous monitoring with monthly reports and incident response." },
];

const faqs = [
  { q: "What's the difference between Sentinel Pro and a Security Audit?", a: "The Security Audit is a one-time review — you get a report and fix prompts. Sentinel Pro is ongoing: I set up monitoring infrastructure, harden your app, and continuously watch for new vulnerabilities, performance issues, and threats over time." },
  { q: "Do I need a Security Audit first?", a: "Not required, but recommended. If you haven't had a security review yet, starting with the Security Audit gives you a baseline. Sentinel Pro then keeps your app protected going forward." },
  { q: "How do alerts work?", a: "When monitoring detects a vulnerability, data exposure, performance degradation, or suspicious activity, you receive an alert through your preferred channel (email, dashboard, or both). For monthly retainer clients, I also begin triaging and fixing the issue." },
  { q: "What does the monthly retainer include?", a: "Continuous 24/7 monitoring, real-time alerts, uptime and performance tracking, monthly security and performance reports, priority incident response, monthly hardening updates, and direct access for escalations." },
  { q: "Can I cancel the monthly plan?", a: "Yes. The monthly retainer is month-to-month with no long-term contract. Cancel anytime and monitoring continues through the end of your billing period." },
  { q: "What apps benefit most from Sentinel Pro?", a: "Apps with real paying users, apps handling payments or PII, marketplace apps with multiple roles, internal tools with sensitive data, and apps that can't afford downtime or data breaches." },
  { q: "Do you monitor third-party integrations?", a: "Yes. If your app connects to Stripe, Resend, Square, or other services, I monitor the integration points for misconfigurations, exposed credentials, and security issues." },
  { q: "How fast is incident response?", a: "Monthly retainer clients get priority incident response — typically within 24 hours of an alert being triggered. One-time setup clients can upgrade to monthly or book a Kode Session for incident response." },
];

export default function SentinelPro() {
  useEffect(() => {
    trackEvent("page_view", { page: "sentinel_pro_service" });
  }, []);

  const handleCTA = (label) => {
    trackEvent("service_cta_click", { service: "sentinel_pro", cta: label });
  };

  return (
    <>
      <Seo
        title="Sentinel Pro — Continuous Security Monitoring & Threat Detection | KodeBase"
        description="Premium monitoring for serious Base44 apps. Real-time security alerts, uptime tracking, vulnerability detection, and incident response. Setup + monthly retainer options."
        path="/services/sentinel-pro"
        image="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/d8100c1d0_generated_image.png"
        jsonLd={[faqSchema(faqs)]}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <Monitor className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Premium Monitoring · 24/7 Protection</span>
            </div>
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="font-sora font-extrabold text-4xl md:text-6xl tracking-tight mb-4"
          >
            Your app is live.<br />
            <span className="text-gradient-orange">Who's watching it?</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Sentinel Pro is premium monitoring plus security hardening for serious Base44 apps. Real-time alerts, uptime tracking, vulnerability detection, and fast incident response — so problems get caught before users do.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {[
              { icon: Bell, label: "Real-time alerts" },
              { icon: Shield, label: "Security hardening" },
              { icon: Activity, label: "24/7 monitoring" },
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
                Protect My App <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">The problem</p>
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-6">
            A one-time audit finds issues today.<br />What about tomorrow?
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-4">
            Apps change. New features get shipped. Roles get added. Backend functions get exposed. Every deployment is a chance for a new vulnerability to slip in.
          </p>
          <p className="text-muted-foreground text-base leading-relaxed">
            Sentinel Pro watches your app continuously — catching security issues, performance degradation, and data exposure <span className="text-foreground font-semibold">before your users or attackers do.</span>
          </p>
        </div>
      </section>

      {/* Monitoring areas */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What Sentinel monitors</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">Eight areas under continuous watch.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every layer of your app — checked, alerted, and responded to.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {monitoringAreas.map(({ icon: Icon, label, desc }, i) => (
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
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Best fit</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">Built for apps with stakes.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {bestFit.map((item, i) => (
              <motion.div
                key={item}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3}
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
      <section id="pricing" className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Pricing</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">Two ways to stay protected.</h2>
            <p className="text-muted-foreground">Start with a one-time setup, or subscribe to ongoing monitoring.</p>
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
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">How it works</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">From setup to continuous protection.</h2>
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

      {/* FAQ */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">FAQ</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">Frequently Asked Questions</h2>
          </div>
          <ServiceFAQ faqs={faqs} />
        </div>
      </section>

      {/* Keep exploring */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Keep exploring</p>
            <h2 className="font-sora font-extrabold text-3xl tracking-tight">Related services</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { tag: "One-time review", title: "Security Audit", desc: "Get a one-time security report with fix prompts or full remediation.", to: "/services/security-audit", cta: "Learn more" },
              { tag: "Emergency repair", title: "ER Service", desc: "App already broken? Get a full audit and fix for bugs, UX, and architecture.", to: "/services/er-service", cta: "Learn more" },
              { tag: "Ongoing support", title: "KodeCare", desc: "Monthly support retainers for ongoing development, fixes, and improvements.", to: "/services/kodecare", cta: "Learn more" },
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
            Don't wait for a breach to start monitoring.
          </h2>
          <p className="text-muted-foreground mb-8">Set up Sentinel Pro today and catch issues before they become incidents.</p>
          <ServiceCheckoutButton
            serviceId="sentinel_pro_setup"
            label="Protect My App"
            className="px-10 inline-flex w-auto"
            onClick={() => handleCTA("final_cta")}
          />
        </div>
      </section>
    </>
  );
}