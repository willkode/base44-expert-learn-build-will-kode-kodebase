import React, { useEffect } from "react";
import { motion } from "framer-motion";
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
import ProHero from "@/components/promembership/ProHero";
import ProHighlights from "@/components/promembership/ProHighlights";
import ProBenefitCard from "@/components/promembership/ProBenefitCard";
import ProCtaFooter from "@/components/promembership/ProCtaFooter";

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

      <ProHero />

      <ProHighlights highlights={PLAN_HIGHLIGHTS} />

      {/* Benefit cards */}
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">Membership Perks</span>
          <h2 className="font-sora font-bold text-3xl md:text-4xl mt-2 mb-3">What's included in Pro</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Six powerful perks, one plan. Here's everything you can do as a Pro member.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, i) => (
            <ProBenefitCard key={benefit.title} benefit={benefit} index={i} />
          ))}
        </div>
      </section>

      <ProCtaFooter />
    </>
  );
}