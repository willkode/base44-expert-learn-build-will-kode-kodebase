import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";

const NEBULA_BG = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/412194915_d32a9ead9_Gemini_Generated_Image_cy4o04cy4o04cy4o.png";
const WILL_PHOTO = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a75f49248_b2ff656b5_will-kode-hero-profile.png";

export default function GrowthHero({ onCTA }) {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${NEBULA_BG})` }}
      />

      <motion.img
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        src={WILL_PHOTO}
        alt="Will Kode — Base44 Moderator & Founding Ambassador"
        className="hidden lg:block absolute right-0 bottom-0 h-full w-auto object-cover object-bottom z-0 pointer-events-none"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent z-[1]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-[1]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-16 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-7 backdrop-blur-sm">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">
              Base44 Growth Consulting · From $250
            </span>
          </div>

          <h1 className="font-sora font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-6">
            <span className="whitespace-nowrap">I Help Base44 Founders</span>
            <br />
            <span className="text-gradient-orange whitespace-nowrap">Get Customers</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
            You built the app. Now you need people to find it, understand it, sign up, pay for it,
            and stick around. I build the marketing and growth strategy that gets you there —
            positioning, pricing, launch, acquisition and conversion.
          </p>
          <p className="text-base md:text-lg text-foreground font-semibold mb-9">
            You don't need more features. You need customers.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10">
            <a href="#strategy-session" onClick={() => onCTA?.("hero_primary")}>
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-red-500 text-primary-foreground font-semibold text-base px-7 py-6 shadow-lg shadow-red-600/30 group transition-transform hover:-translate-y-0.5"
              >
                Book a Growth Strategy Session — $125
                <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <div className="p-[1.5px] rounded-md bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15]">
              <a href="#packages" onClick={() => onCTA?.("hero_secondary")}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full bg-background hover:bg-white/10 text-white border-0 font-semibold text-base px-7 py-6"
                >
                  See Packages
                </Button>
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Base44 Moderator
            </span>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <span>Founding Ambassador</span>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <span>Hosted Base44 marketing &amp; dev events</span>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <span>Featured multiple times by Base44</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}