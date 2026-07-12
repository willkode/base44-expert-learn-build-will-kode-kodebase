import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { faqSchema } from "@/lib/seo";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart, ArrowRight, CheckCircle, Clock, Wrench, Bug,
  Shield, Zap, Code2, Headphones, Rocket, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ServiceCheckoutButton from "@/components/services/ServiceCheckoutButton";
import ServiceFAQ from "@/components/services/ServiceFAQ";
import { trackEvent } from "@/lib/analytics";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

const supportAreas = [
  { icon: Bug, label: "Bug Fixes", desc: "Fast turnaround fixes when things break" },
  { icon: Wrench, label: "Feature Additions", desc: "Small features and improvements each month" },
  { icon: Shield, label: "Security Patches", desc: "Keeping your app secure as it evolves" },
  { icon: Code2, label: "Code Quality", desc: "Refactors and cleanup to keep things maintainable" },
  { icon: Zap, label: "Performance Tuning", desc: "Speed optimizations and Core Web Vitals" },
  { icon: Headphones, label: "Priority Support", desc: "Direct access — no ticket queues" },
  { icon: Rocket, label: "Launch Assistance", desc: "Help going live and scaling" },
  { icon: TrendingUp, label: "Growth Guidance", desc: "Strategic advice on what to build next" },
];

const bestFit = [
  "Builders who launched and need ongoing help",
  "Apps that keep getting bugs they can't trace",
  "Non-technical founders managing a Base44 app",
  "Teams without a dedicated developer",
  "Apps that need regular feature updates",
  "Builders who want an expert on call",
  "Apps preparing to scale or monetize",
  "Apps that keep hitting the same issues",
];

const plans = [
  {
    title: "KodeCare Starter",
    subtitle: "Light monthly support",
    price: "$120/mo",
    billing: "monthly",
    badge: null,
    features: [
      "Up to 2 hours of dev time per month",
      "Bug fixes and small tweaks",
      "Security patches",
      "Email support (48hr response)",
      "Monthly health check report",
      "Roll-over hours (up to 1 month)",
    ],
    cta: "Start KodeCare Starter",
    serviceId: "kodecare_starter",
  },
  {
    title: "KodeCare Growth",
    subtitle: "Ongoing partnership",
    price: "$250/mo",
    billing: "monthly",
    badge: "Most Popular",
    features: [
      "Up to 5 hours of dev time per month",
      "Everything in Starter",
      "Feature additions",
      "Performance optimizations",
      "Priority support (24hr response)",
      "Monthly strategy call (30 min)",
      "Roll-over hours (up to 1 month)",
    ],
    cta: "Start KodeCare Growth",
    serviceId: "kodecare_growth",
  },
  {
    title: "KodeCare Pro",
    subtitle: "Dedicated support",
    price: "$500/mo",
    billing: "monthly",
    badge: null,
    features: [
      "Up to 10 hours of dev time per month",
      "Everything in Growth",
      "Complex features & integrations",
      "Same-day priority response",
      "Bi-weekly strategy calls (45 min)",
      "Architecture & scaling guidance",
      "Roll-over hours (up to 1 month)",
    ],
    cta: "Start KodeCare Pro",
    serviceId: "kodecare_pro",
  },
];

const steps = [
  { num: "01", title: "Choose your plan", desc: "Pick the monthly retainer that fits your needs." },
  { num: "02", title: "Complete intake", desc: "Share your app URL, current issues, and priorities." },
  { num: "03", title: "Pay & onboard", desc: "Quick checkout, then we kick off with a kickoff call." },
  { num: "04", title: "Submit requests", desc: "Send bugs, feature requests, and priorities each month." },
  { num: "05", title: "I get to work", desc: "Fixes, features, patches, and optimizations delivered." },
  { num: "06", title: "Review & repeat", desc: "Monthly health checks, strategy calls, and ongoing care." },
];

const faqs = [
  { q: "What is KodeCare?", a: "KodeCare is a monthly support retainer for Base44 apps. You get a set number of development hours each month for bug fixes, feature additions, security patches, performance tuning, and strategic guidance — all from a certified Base44 expert." },
  { q: "How are hours tracked?", a: "Each plan includes a set number of dev hours per month. I track time spent on your requests and report it in your monthly health check. Unused hours roll over for up to one additional month." },
  { q: "What happens if I need more hours?", a: "If you consistently need more hours, you can upgrade to a higher tier. For one-off spikes, additional hours are billed at a discounted rate of $60/hour for retainer clients." },
  { q: "Can I cancel anytime?", a: "Yes. All KodeCare plans are month-to-month with no long-term contract. Cancel anytime and service continues through the end of your billing period." },
  { q: "What's the difference between KodeCare and Kode Sessions?", a: "Kode Sessions are one-off 1-2 hour calls for specific questions or guidance. KodeCare is an ongoing monthly retainer where I actively do the development work — fixing bugs, building features, and maintaining your app." },
  { q: "Do you work on any app or only Base44?", a: "KodeCare is specifically for Base44 apps. If you have a non-Base44 project, contact me and I'll let you know if it's something I can help with." },
  { q: "How do I submit requests?", a: "You get a direct channel (email or dashboard) to submit bugs, feature requests, and priorities. For Growth and Pro plans, we also have regular strategy calls to plan the month's work." },
  { q: "What's not included?", a: "KodeCare doesn't cover full app rebuilds, major architecture migrations, or brand-new app builds. For those, check out my Products or book a Kode Session to scope the project." },
];

export default function KodeCare() {
  useEffect(() => {
    trackEvent("page_view", { page: "kodecare_service" });
  }, []);

  const handleCTA = (label) => {
    trackEvent("service_cta_click", { service: "kodecare", cta: label });
  };

  return (
    <>
      <Seo
        title="KodeCare — Monthly Support Retainer for Base44 Apps | KodeBase"
        description="Ongoing monthly support for your Base44 app. Bug fixes, feature additions, security patches, performance tuning, and strategic guidance from a certified Base44 expert. Plans from $120/mo."
        path="/services/kodecare"
        image="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/ee1891c15_generated_image.png"
        jsonLd={[faqSchema(faqs)]}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <Heart className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Monthly Support Retainer · Ongoing Care</span>
            </div>
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="font-sora font-extrabold text-4xl md:text-6xl tracking-tight mb-4"
          >
            Your app shipped.<br />
            <span className="text-gradient-orange">Now keep it healthy.</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            KodeCare is a monthly support retainer for Base44 apps. Bug fixes, feature additions, security patches, and strategic guidance — all from a certified Base44 expert who knows your app.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {[
              { icon: Wrench, label: "Bug fixes & features" },
              { icon: Headphones, label: "Direct access" },
              { icon: Shield, label: "Security patches" },
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
                Get KodeCare <ArrowRight className="w-4 h-4 ml-1" />
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
            Building is easy.<br />Maintaining is hard.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-4">
            You launched your app. Now bugs appear. Features need updating. Security patches are overdue. Performance is degrading. And you're not sure what to build next.
          </p>
          <p className="text-muted-foreground text-base leading-relaxed">
            KodeCare gives you a certified Base44 expert on call — <span className="text-foreground font-semibold">someone who knows your app, fixes things fast, and helps you grow.</span>
          </p>
        </div>
      </section>

      {/* Support areas */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What's covered</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">Eight ways KodeCare helps.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Everything your app needs to stay healthy and grow.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {supportAreas.map(({ icon: Icon, label, desc }, i) => (
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
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">Built for apps that need ongoing care.</h2>
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
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Pricing</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">Three plans. One expert.</h2>
            <p className="text-muted-foreground">Month-to-month. Cancel anytime. Roll-over hours included.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
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
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">From signup to ongoing care.</h2>
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
              { tag: "Continuous monitoring", title: "Sentinel Pro", desc: "Premium monitoring and security hardening for serious apps.", to: "/services/sentinel-pro", cta: "Learn more" },
              { tag: "1-on-1 guidance", title: "Kode Sessions", desc: "Book a 1-2 hour expert session for specific questions or guidance.", to: "/services/kode-sessions", cta: "Learn more" },
              { tag: "Emergency repair", title: "ER Service", desc: "App already broken? Get a full audit and fix for bugs and architecture.", to: "/services/er-service", cta: "Learn more" },
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
            Your app deserves ongoing care.
          </h2>
          <p className="text-muted-foreground mb-8">Pick a plan, onboard, and get a certified Base44 expert in your corner every month.</p>
          <ServiceCheckoutButton
            serviceId="kodecare_starter"
            label="Get KodeCare"
            className="px-10 inline-flex w-auto"
            onClick={() => handleCTA("final_cta")}
          />
        </div>
      </section>
    </>
  );
}