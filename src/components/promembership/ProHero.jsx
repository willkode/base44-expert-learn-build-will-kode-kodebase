import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

// Pure visual redesign of the hero. Copy + links are unchanged.
export default function ProHero() {
  return (
    <section className="relative overflow-hidden bg-background blueprint-grid">
      {/* layered glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[80vw] max-w-3xl h-72 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-40 -right-20 w-72 h-72 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-28 pb-20 md:pt-36 md:pb-28 text-center">
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 mb-6 backdrop-blur-sm"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">Pro Membership</span>
        </motion.div>

        <motion.h1
          variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="font-sora font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.05] mb-5"
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
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 font-semibold px-8 glow-orange">
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link to="/pricing" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">View Plans</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}