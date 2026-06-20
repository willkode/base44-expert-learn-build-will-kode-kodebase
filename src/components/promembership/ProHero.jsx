import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";

const HERO_BG = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/774a81b65_generated_image.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

// Hero styled to match the Home page: full-bleed AI background, readability overlays,
// gradient-border secondary button. Copy + links unchanged.
export default function ProHero() {
  return (
    <section className="relative overflow-hidden min-h-[80vh] flex items-center">
      {/* AI background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_BG})` }} />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40 z-[1]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-[1]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-20 lg:pt-28 text-center">
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 mb-7 backdrop-blur-sm"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">Pro Membership</span>
        </motion.div>

        <motion.h1
          variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="font-sora font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-6 max-w-3xl mx-auto"
        >
          Everything you need to{" "}
          <span className="text-gradient-orange">build faster</span>
        </motion.h1>

        <motion.p
          variants={fadeUp} initial="hidden" animate="show" custom={2}
          className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-9"
        >
          Your Pro plan unlocks the full KodeBase stack — from idea to shipped app with structured blueprints, ordered prompts, a curated vault, and expert support.
        </motion.p>

        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={3}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center"
        >
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-red-500 text-primary-foreground font-semibold text-base px-7 py-6 shadow-lg shadow-red-600/30 group transition-transform hover:-translate-y-0.5">
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <div className="p-[1.5px] rounded-md bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] w-full sm:w-auto">
            <Link to="/pricing" className="block">
              <Button size="lg" variant="outline" className="w-full bg-background hover:bg-white/10 text-white border-0 font-semibold text-base px-7 py-6">
                View Plans
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}