import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";

const CTA_BG = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c5ae1c23f_generated_image.png";

// Final upgrade CTA — same copy, styled to match Home with a full-bleed AI banner backdrop.
export default function ProCtaFooter() {
  return (
    <section className="relative px-6 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${CTA_BG})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative max-w-2xl mx-auto text-center rounded-3xl border border-primary/20 bg-card/60 backdrop-blur-sm p-10 md:p-14"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-5">
          <Crown className="w-7 h-7 text-amber-400" />
        </div>
        <h2 className="font-sora font-bold text-2xl md:text-3xl mb-3">Not on Pro yet?</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">Upgrade to Pro for $39/mo and unlock the full KodeBase toolkit today.</p>
        <Link to="/pricing">
          <Button size="lg" className="bg-primary hover:bg-red-500 font-semibold px-10 shadow-lg shadow-red-600/30 transition-transform hover:-translate-y-0.5">
            Upgrade to Pro <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}