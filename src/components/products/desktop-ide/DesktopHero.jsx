import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SHOTS, HERO_SPECS } from "@/components/products/desktop-ide/desktopIdeData";
import { trackEvent } from "@/lib/analytics";

export default function DesktopHero({ onEarlyAccess, onExplore }) {
  return (
    <section className="pt-16 pb-20 px-6 blueprint-grid">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
            <Monitor className="w-4 h-4" /> Windows desktop application
          </span>
          <h1 className="font-sora font-bold text-4xl md:text-6xl tracking-tight mt-5 mb-6">
            Base44 <span className="text-gradient-orange">BaaS Desktop</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            A local workbench for everything you have built on Base44. Open any app in a real editor without leaving the
            desktop, put an AI reviewer over your own code, and — when you want to — lift the frontend onto your own
            hosting while the Base44 backend keeps running untouched.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => { trackEvent("cta_get_lifetime", { location: "hero" }); onEarlyAccess(); }}
              className="font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90 glow-orange"
            >
              Get Lifetime Access — $25 <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => { trackEvent("cta_explore_features", { location: "hero" }); onExplore(); }}>
              See what it does
            </Button>
          </div>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {HERO_SPECS.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card/60 p-4 text-left">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-sm font-semibold">{s.value}</p>
            </div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mt-14">
          <img
            src={SHOTS.home}
            alt="Base44 BaaS Desktop showing every app in your Base44 account as tiles"
            className="rounded-2xl border border-border bg-[#0a0f1e] glow-orange w-full"
          />
          <p className="text-sm text-muted-foreground mt-5 max-w-2xl mx-auto">
            <span className="text-foreground font-semibold">Your real account, on your machine.</span>{" "}
            Every app, superagent and game you own — each in its own section, one click from the editor.
          </p>
        </motion.div>
      </div>
    </section>
  );
}