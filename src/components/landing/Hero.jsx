import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Database, ShieldCheck, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  const getStarted = () => navigate("/register");

  return (
    <section className="relative pt-40 pb-28 overflow-hidden">
      {/* Layered ambient background */}
      <div className="absolute inset-0 blueprint-grid opacity-[0.5]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[900px] h-[560px] bg-primary/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your AI Software Architecture Team</span>
          </div>

          <h1 className="font-sora font-extrabold text-4xl md:text-6xl lg:text-7xl leading-[1.04] tracking-tight mb-7">
            Stop shipping apps that
            <br />
            <span className="text-gradient-orange">break when real users show up.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Kode Architect turns your idea into a complete build plan — data model, user roles,
            permissions, security, and copy-paste AI prompts — before you write a single line.
            Build it right the first time instead of rebuilding it three times.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              onClick={getStarted}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base px-8 h-13 py-6 glow-orange group w-full sm:w-auto transition-transform hover:-translate-y-0.5"
            >
              Build My Blueprint Free
              <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => document.querySelector("#how")?.scrollIntoView({ behavior: "smooth" })}
              size="lg"
              variant="outline"
              className="border-border bg-card/50 hover:bg-card text-foreground font-semibold text-base px-8 py-6 w-full sm:w-auto"
            >
              See How It Works
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Soft glow behind preview */}
          <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-2xl" />
          <div className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-6 md:p-8 shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center gap-2 mb-6 pb-5 border-b border-border/60">
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
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="group rounded-xl border border-border bg-secondary/40 p-5 text-left hover:border-primary/40 hover:bg-secondary/60 transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <c.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-sora font-semibold text-sm mb-1">{c.title}</h3>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}