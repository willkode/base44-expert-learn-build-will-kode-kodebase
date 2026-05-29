import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function FinalCTA() {
  const getStarted = () => base44.auth.redirectToLogin();

  return (
    <section className="py-24 relative">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl border border-primary/30 bg-card/80 overflow-hidden p-12 md:p-16 text-center"
        >
          <div className="absolute inset-0 blueprint-grid opacity-40" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/15 rounded-full blur-[100px]" />
          <div className="relative">
            <h2 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight mb-5">
              Don't just prompt AI.
              <br />
              <span className="text-gradient-orange">Architect it first.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Join the builders shipping clean, secure, scalable apps — starting with the right blueprint.
            </p>
            <Button
              onClick={getStarted}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base px-10 py-6 glow-orange group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-xs text-muted-foreground mt-5">No credit card required · Start in seconds</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}