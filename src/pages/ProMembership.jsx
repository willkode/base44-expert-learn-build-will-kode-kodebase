import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Seo from "@/components/seo/Seo";
import { trackEvent } from "@/lib/analytics";
import {
  Crown,
  Layers,
  Wand2,
  Vault,
  HeadphonesIcon,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  FileCode2,
  Lock,
  Phone,
  Percent,
} from "lucide-react";

const OG_IMAGE = "https://ucarecdn.com/b9e28e1f-6e6a-4f7d-bd60-4d7a5b5f1234/prokodebase.jpg";

const BENEFITS = [
  {
    icon: Layers,
    title: "Blueprint System",
    badge: "Unlimited",
    color: "from-blue-500/20 to-blue-600/10 border-blue-500/20",
    iconColor: "text-blue-400",
    description:
      "Generate fully structured app blueprints from a single idea. Get entities, roles, pages, workflows, integrations, and a recommended build order — all in one AI-powered discovery session.",
    features: [
      "25 blueprints per month",
      "Entity & data model planning",
      "Role & permission design",
      "Workflow & integration mapping",
      "Markdown & client-ready PDF export",
    ],
    cta: { label: "Open Blueprint Tool", href: "/tools/prompt-generator" },
  },
  {
    icon: Wand2,
    title: "Prompt Engine",
    badge: "Pro Exclusive",
    color: "from-primary/20 to-primary/10 border-primary/20",
    iconColor: "text-primary",
    description:
      "Turn your blueprint into a full ordered prompt pack — every prompt you need to build your app in the right sequence, from foundation to polish. Copy, paste, build.",
    features: [
      "Ordered build sequence prompts",
      "Foundation → Data → Permissions → Features",
      "Admin, Integrations, QA, Security & Polish",
      "Copy-paste ready for any AI builder",
      "Prompts saved to your account",
    ],
    cta: { label: "Open Prompt Engine", href: "/tools/prompt-engine" },
  },
  {
    icon: Lock,
    title: "Prompt Vault",
    badge: "Pro Exclusive",
    color: "from-amber-500/20 to-amber-600/10 border-amber-500/20",
    iconColor: "text-amber-400",
    description:
      "Access a curated library of expert-crafted prompts across development, business, SEO, marketing, AI, and productivity. Hand-picked and updated regularly.",
    features: [
      "Full vault access (200+ prompts)",
      "Categories: Dev, Business, SEO, AI, Marketing",
      "Recommended AI model per prompt",
      "Searchable & filterable library",
      "New prompts added regularly",
    ],
    cta: { label: "Browse the Vault", href: "/vault/access" },
  },
  {
    icon: Phone,
    title: "Monthly Strategy Call",
    badge: "1 Free / Month",
    color: "from-primary/20 to-amber-500/10 border-primary/20",
    iconColor: "text-primary",
    description:
      "Every month, Pro members get one free 1-hour live call with Will — for build strategy, debugging, or a second opinion. Need more? Book extra sessions at your discounted Pro rate.",
    features: [
      "1 free 1-hour call every month",
      "Live screen-share & build help",
      "Strategy, debugging & planning",
      "Extra calls at 40% off ($75)",
      "Request directly from your dashboard",
    ],
    cta: { label: "Request a Call", href: "/dashboard" },
  },
  {
    icon: Percent,
    title: "40% Member Discount",
    badge: "On Everything",
    color: "from-amber-500/20 to-orange-600/10 border-amber-500/20",
    iconColor: "text-amber-400",
    description:
      "Pro members save 40% on all products and services — prompt packs, audits, sessions, and more. The discount is applied automatically at checkout, no code needed.",
    features: [
      "40% off all products",
      "40% off all services",
      "Applied automatically at checkout",
      "Stacks across the full catalog",
      "Pays for itself fast",
    ],
    cta: { label: "Browse Products", href: "/products" },
  },
  {
    icon: HeadphonesIcon,
    title: "Priority Support",
    badge: "Pro Perk",
    color: "from-green-500/20 to-green-600/10 border-green-500/20",
    iconColor: "text-green-400",
    description:
      "Skip the queue. Pro members get priority responses via WhatsApp and email — whether you're debugging, planning, or need a second opinion on your build.",
    features: [
      "Priority WhatsApp access",
      "Priority email support",
      "Faster response times",
      "Build strategy advice",
      "Direct line to the KodeBase team",
    ],
    cta: { label: "Contact Support", href: "/contact" },
  },
];

const PLAN_HIGHLIGHTS = [
  { icon: Zap, label: "25 projects / month" },
  { icon: Layers, label: "25 blueprints / month" },
  { icon: Wand2, label: "Full Prompt Engine access" },
  { icon: Lock, label: "Prompt Vault access" },
  { icon: Phone, label: "1 free 1-hour call / month" },
  { icon: Percent, label: "40% off all products & services" },
  { icon: FileCode2, label: "Client-ready exports" },
  { icon: Shield, label: "Security reviews & QA checklists" },
  { icon: HeadphonesIcon, label: "Priority support" },
  { icon: CheckCircle2, label: "Reusable templates" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

export default function ProMembership() {
  useEffect(() => {
    trackEvent("view_pro_membership", { page_path: "/pro" });
  }, []);

  return (
    <>
      <Seo
        title="Pro Membership — KodeBase"
        description="Everything in your Pro plan: Blueprint System, Prompt Engine, Prompt Vault, and priority support. Build faster with the full KodeBase toolkit."
        path="/pro"
        type="website"
        image={OG_IMAGE}
        jsonLd={[{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "KodeBase Pro",
          "description": "Pro membership for the KodeBase platform. Includes Blueprint System, Prompt Engine, Prompt Vault, and priority support.",
          "brand": { "@type": "Brand", "name": "KodeBase" },
          "offers": { "@type": "Offer", "price": "39.00", "priceCurrency": "USD", "priceSpecification": { "@type": "UnitPriceSpecification", "billingDuration": "P1M" } }
        }]}
      />

      {/* Hero */}
      <section className="relative min-h-[52vh] flex items-center justify-center overflow-hidden bg-background blueprint-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-24 text-center">
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 mb-6"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">Pro Membership</span>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="font-sora font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-5"
          >
            Everything you need to{" "}
            <span className="text-gradient-orange">build faster</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10"
          >
            Your Pro plan unlocks the full KodeBase stack — from idea to shipped app with structured blueprints, ordered prompts, a curated vault, and expert support.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="flex flex-wrap gap-3 justify-center"
          >
            <Link to="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 font-semibold px-8 glow-orange">
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline">View Plans</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Plan highlights strip */}
      <section className="border-y border-border bg-card/50 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PLAN_HIGHLIGHTS.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.05}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefit cards */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="font-sora font-bold text-3xl md:text-4xl mb-3">What's included in Pro</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Six powerful perks, one plan. Here's everything you can do as a Pro member.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {BENEFITS.map(({ icon: Icon, title, badge, color, iconColor, description, features, cta }, i) => (
            <motion.div
              key={title}
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i * 0.1}
              className={`rounded-2xl border bg-gradient-to-br ${color} p-6 flex flex-col gap-5`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-card/60 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-sora font-bold text-lg">{title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-white/70">{badge}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>

              <ul className="space-y-2 pl-1">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <Link to={cta.href}>
                  <Button size="sm" variant="outline" className="w-full border-white/10 hover:bg-white/5 font-medium">
                    {cta.label} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="border-t border-border bg-card/30 py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <Crown className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="font-sora font-bold text-2xl md:text-3xl mb-3">Not on Pro yet?</h2>
          <p className="text-muted-foreground mb-8">Upgrade to Pro for $39/mo and unlock the full KodeBase toolkit today.</p>
          <Link to="/pricing">
            <Button size="lg" className="bg-primary hover:bg-primary/90 font-semibold px-10 glow-orange">
              Upgrade to Pro <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}