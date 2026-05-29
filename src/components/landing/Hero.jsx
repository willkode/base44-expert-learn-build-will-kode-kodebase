import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Database, ShieldCheck, LayoutGrid } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Hero() {
  const getStarted = () => base44.auth.redirectToLogin();

  return (
    <section className="relative pt-36 pb-24 overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your AI Software Architect</span>
          </div>

          <h1 className="font-sora font-extrabold text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6">
            Before AI builds your app,
            <br />
            <span className="text-gradient-orange">let AI architect it correctly.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Turn any software idea into a complete build plan — architecture, entities, roles,
            permissions, security model, and AI-ready prompts. Stop building messy, insecure apps.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Button
              onClick={getStarted}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base px-8 h-13 py-6 glow-orange group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => document.querySelector("#how")?.scrollIntoView({ behavior: "smooth" })}
              size="lg"
              variant="outline"
              className="border-border bg-card/50 hover:bg-card text-foreground font-semibold text-base px-8 py-6"
            >
              See How It Works
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-primary/60" />
              <div className="w-3 h-3 rounded-full bg-chart-2/60" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">build-blueprint.kode</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Database, title: "Data Model", desc: "9 entities mapped with relations" },
                { icon: ShieldCheck, title: "Security Model", desc: "Role-based access + ownership rules" },
                { icon: LayoutGrid, title: "Page Map", desc: "12 pages across user & admin flows" },
              ].map((c, i) => (
                <div key={i} className="rounded-xl border border-border bg-secondary/40 p-5 text-left">
                  <c.icon className="w-7 h-7 text-primary mb-3" />
                  <h3 className="font-sora font-semibold text-sm mb-1">{c.title}</h3>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}