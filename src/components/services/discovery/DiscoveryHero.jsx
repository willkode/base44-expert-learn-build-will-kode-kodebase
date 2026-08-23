import React from "react";
import { motion } from "framer-motion";
import { Stethoscope, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DISCOVERY_PRICE, heroPoints } from "@/components/services/discovery/discoveryAuditData";

export default function DiscoveryHero({ onCta }) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
            <Stethoscope className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Discovery Audit</span>
          </div>
          <h1 className="font-sora font-extrabold text-4xl md:text-6xl tracking-tight mb-5">
            Find out everything<br />
            <span className="text-gradient-orange">wrong with your app.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            A complete review of your entire app — security, code quality, functionality and UI/UX.
            You get a full report of every issue, I fix all the major security and functionality problems
            at no extra cost, and you get a targeted list of prompts for the rest.
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
            Think of it as a mechanic putting your app on the lift: what's broken, what's risky,
            what needs attention, and what would make it genuinely better.
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="font-sora font-extrabold text-5xl text-gradient-orange">${DISCOVERY_PRICE}</span>
              <span className="text-muted-foreground text-sm">one-time</span>
            </div>
            <a href="#pricing" onClick={onCta}>
              <Button size="lg" className="font-semibold px-8">
                Book My Discovery Audit <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10">
            {heroPoints.map((p) => (
              <span key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary" />
                {p}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}