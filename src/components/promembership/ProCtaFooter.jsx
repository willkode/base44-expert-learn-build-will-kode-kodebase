import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";

// Final upgrade CTA — same copy, restyled into a glowing bordered panel.
export default function ProCtaFooter() {
  return (
    <section className="relative px-4 py-20 overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-40" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative max-w-2xl mx-auto text-center rounded-3xl border border-primary/20 bg-gradient-to-b from-card/80 to-card/30 backdrop-blur-sm p-10 md:p-14"
      >
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-40 bg-primary/15 blur-[90px] rounded-full pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-5">
            <Crown className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="font-sora font-bold text-2xl md:text-3xl mb-3">Not on Pro yet?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Upgrade to Pro for $39/mo and unlock the full KodeBase toolkit today.</p>
          <Link to="/pricing">
            <Button size="lg" className="bg-primary hover:bg-primary/90 font-semibold px-10 glow-orange">
              Upgrade to Pro <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}