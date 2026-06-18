import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { faqSchema } from "@/lib/seo";
import {
  Bug, Layers, Sparkles, Layout, GitBranch, Zap, Shield, Monitor,
  CheckCircle, Clock, ArrowRight, ChevronDown, ChevronUp, Star, Users, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/layout/PublicLayout";
import { trackEvent } from "@/lib/analytics";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

const whatWeCover = [
  { icon: Bug, label: "Live Debugging", desc: "Fix bugs together in real time" },
  { icon: Layers, label: "App Foundation", desc: "Plan architecture and structure" },
  { icon: Sparkles, label: "Prompt Improvement", desc: "Refine your AI prompts" },
  { icon: Layout, label: "UI Cleanup", desc: "Fix layout and design issues" },
  { icon: GitBranch, label: "Architecture", desc: "Plan scalable patterns" },
  { icon: Zap, label: "Feature Build", desc: "Build features live together" },
  { icon: Shield, label: "Security Review", desc: "Spot vulnerabilities live" },
  { icon: Monitor, label: "Screen-share Teaching", desc: "Learn while we build" },
];

const plans = [
  {
    title: "1 Hour Session",
    subtitle: "Quick fixes and focused guidance",
    price: "$75",
    billing: "one-time",
    features: [
      "60 minutes live",
      "Screen share + live coding",
      "Bug triage or focused build",
      "Follow-up notes",
    ],
    badge: null,
    cta: "Book 1 Hour",
    href: "https://checkout.square.site/merchant/MLYDVQNYZ9YXJ/checkout/6ZFPBTVBBPZUIPKGW44SPJF4",
  },
  {
    title: "2 Hour Session",
    subtitle: "Deeper building and debugging",
    price: "$150",
    billing: "one-time",
    features: [
      "120 minutes live",
      "Feature builds + debugging",
      "Workflow setup",
      "Priority follow-up",
    ],
    badge: "Most popular",
    cta: "Book 2 Hours",
    href: "https://checkout.square.site/merchant/MLYDVQNYZ9YXJ/checkout/6ZFPBTVBBPZUIPKGW44SPJF4",
  },
];

const steps = [
  { num: "01", title: "Choose your session", desc: "1 hour, 2 hours, or KodeCare." },
  { num: "02", title: "Pay & complete intake", desc: "Quick form about your project and goals." },
  { num: "03", title: "Pick a time", desc: "Select from available slots within days." },
  { num: "04", title: "Get on the call", desc: "Confirmation + meeting link emailed." },
  { num: "05", title: "Build live together", desc: "Share your screen and let's go." },
  { num: "06", title: "Receive notes", desc: "Follow-up summary after the call." },
];

const faqs = [
  { q: "What can we cover in one hour?", a: "Quite a bit. We scope your top 1–2 priorities at the start and go heads-down. Common wins: fixing a critical bug, refining your app architecture, cleaning up a messy UI, or getting a stuck feature shipped." },
  { q: "Do I need to prepare anything?", a: "Not much. Have your app open and know your top 1–3 goals for the call. A quick note about what's blocking you helps us hit the ground running." },
  { q: "Can you work on a live app?", a: "Yes. Whether it's Base44, a custom React project, or something in between — if it runs in a browser and we can screen share, we can work on it." },
  { q: "Do I need to share my screen?", a: "Yes, screen sharing is how we work together in real time. You stay in control — I guide and build alongside you." },
  { q: "Are sessions recorded?", a: "Sessions are not recorded by default. I provide follow-up notes after every call so you have a clear summary of what we did and next steps." },
  { q: "How does KodeCare work?", a: "KodeCare is a monthly retainer with a 10-hour minimum. You get priority scheduling, dedicated weekly slots, and a reduced rate of $50/hr instead of $75/hr. Perfect if you're actively building and need consistent support." },
];

const bestFit = [
  "Founders building MVPs",
  "Base44 builders",
  "Stuck in a bug loop",
  "Need app structure help",
  "Want live learning",
  "Need direct, no-BS feedback",
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

export default function KodeSessions() {
  useEffect(() => {
    trackEvent("page_view", { page: "kode_sessions_service" });
  }, []);

  const handleBook = (label) => {
    trackEvent("service_cta_click", { service: "kode_sessions", cta: label });
  };

  return (
    <>
      <Seo
        title="Kode Sessions — Live 1-on-1 Expert Help for Base44 | KodeBase"
        description="Book a live 1-on-1 session with Will — debug, build, and ship together in real time via screen share. 30-year developer. Sessions booked within days."
        path="/services/kode-sessions"
        image="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/b91838cc7_generated_image.png"
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
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Live 1-on-1 · Screen-share · Hands-on</span>
            </div>
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="font-sora font-extrabold text-4xl md:text-6xl tracking-tight mb-4"
          >
            Get unstuck.<br />
            <span className="text-gradient-orange">Live with Will.</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Book a session and we'll build, debug, and ship together — in real time, on your screen, on your code.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {[
              { icon: Star, label: "30-year developer" },
              { icon: Clock, label: "Sessions booked within days" },
              { icon: FileText, label: "Follow-up notes included" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </div>
            ))}
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="flex flex-wrap items-center justify-center gap-3">
            <a href="#pricing" onClick={() => handleBook("hero_primary")}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
                Book a Session <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
            <Link to="/services/kodecare">
              <Button size="lg" variant="outline">
                KodeCare — Monthly Support
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What we cover */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What we cover</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">One session. Zero fluff.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">We scope your top priorities at the start, then go heads-down on the work.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {whatWeCover.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}
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

      {/* Pricing */}
      <section id="pricing" className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Pricing</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">Pay per session. No subscriptions.</h2>
            <p className="text-muted-foreground">Pick the time you need. Pay once. Get scheduled within days.</p>
          </div>

          {/* Session plans */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
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
                <div className="flex items-baseline gap-1 mb-6">
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
                <a href={plan.href} target="_blank" rel="noopener noreferrer" onClick={() => handleBook(plan.title)}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" size="lg">
                    {plan.cta}
                  </Button>
                </a>
              </motion.div>
            ))}
          </div>

          {/* Intake note */}
          <p className="text-center text-sm text-muted-foreground mb-8">
            After payment, you'll complete intake details and pick a time slot.
          </p>

          {/* KodeCare callout */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="rounded-2xl border border-border bg-card/60 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-sora font-bold text-xl">KodeCare</span>
                <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">Save 33%</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4 max-w-md">
                Building actively? Get ongoing monthly support with priority scheduling, dedicated weekly slots, and a reduced hourly rate.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> <span><strong className="text-foreground">$50/hr</strong> (vs $75 — save 33%)</span></div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> 10hr minimum/month</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Priority scheduling</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Dedicated weekly slots</div>
              </div>
            </div>
            <Link to="/services/kodecare" onClick={() => handleBook("kodecare_learn_more")}>
              <Button variant="outline" size="lg" className="whitespace-nowrap">
                Learn more <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Best fit */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Best fit</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">Who this is for.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {bestFit.map((item, i) => (
              <motion.div
                key={item}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/60"
              >
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{item}</span>
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
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">From booking to building.</h2>
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
            <h2 className="font-sora font-extrabold text-3xl tracking-tight">Want more than an hour?</h2>
            <p className="text-muted-foreground mt-2">Scale up to ongoing support or hand off the whole project.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { tag: "Full project", title: "Hire Me", desc: "Custom builds, advanced fixes, and scoped development.", to: "/contact", cta: "Learn more" },
              { tag: "Monthly retainer", title: "KodeCare", desc: "Recurring hours every month with priority scheduling.", to: "/services/kodecare", cta: "Learn more" },
              { tag: "About", title: "Meet Will Kode", desc: "Certified Base44 Expert, OG Partner, and trusted moderator.", to: "/contact", cta: "Learn more" },
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
            Book your session and get unstuck faster.
          </h2>
          <a
            href="https://checkout.square.site/merchant/MLYDVQNYZ9YXJ/checkout/6ZFPBTVBBPZUIPKGW44SPJF4"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleBook("final_cta")}
          >
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10">
              Book a Session <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
      </section>
    </>
  );
}