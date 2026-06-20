import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { trackEvent } from "@/lib/analytics";
import {
  Crown,
  Layers,
  Wand2,
  HeadphonesIcon,
  CheckCircle2,
  Zap,
  Shield,
  FileCode2,
  Lock,
  Phone,
  Percent,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ProHero from "@/components/promembership/ProHero";
import ProHighlights from "@/components/promembership/ProHighlights";
import ProBenefitCard from "@/components/promembership/ProBenefitCard";
import ProCtaFooter from "@/components/promembership/ProCtaFooter";

const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c5ae1c23f_generated_image.png";

const BENEFITS = [
  {
    icon: Layers,
    title: "Blueprint System",
    badge: "Unlimited",
    iconColor: "text-blue-400",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/b19e032e0_generated_image.png",
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
    iconColor: "text-primary",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a2b810bf6_generated_image.png",
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
    iconColor: "text-amber-400",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/445de1ec7_generated_image.png",
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
    iconColor: "text-primary",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/741a92683_generated_image.png",
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
    iconColor: "text-amber-400",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/ec264d855_generated_image.png",
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
    iconColor: "text-green-400",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/e719b11ef_generated_image.png",
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
    <div className="dark min-h-screen bg-background text-foreground font-inter antialiased overflow-x-hidden">
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
          "offers": { "@type": "Offer", "price": "25.00", "priceCurrency": "USD", "priceSpecification": { "@type": "UnitPriceSpecification", "billingDuration": "P1M" } }
        }]}
      />
      <Navbar />
      <main>
        <ProHero />

        <ProHighlights highlights={PLAN_HIGHLIGHTS} />

        {/* Benefit cards */}
        <section className="relative py-24 scroll-mt-20">
          <div className="absolute inset-0 blueprint-grid opacity-30" />
          <div className="relative max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <span className="text-sm font-semibold text-primary uppercase tracking-widest">Membership Perks</span>
              <h2 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mt-4 mb-5">
                What's <span className="text-gradient-orange">included in Pro</span>
              </h2>
              <p className="text-lg text-muted-foreground">Six powerful perks, one plan. Here's everything you can do as a Pro member.</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {BENEFITS.map((benefit, i) => (
                <ProBenefitCard key={benefit.title} benefit={benefit} index={i} />
              ))}
            </div>
          </div>
        </section>

        <ProCtaFooter />
      </main>
      <Footer />
    </div>
  );
}