import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_IMAGE } from "@/components/products/desktop-ide/desktopIdeData";
import { trackEvent } from "@/lib/analytics";

const AUDIENCES = ["Base44 Developers", "Agencies", "Freelancers", "Technical Teams", "App Owners"];

export default function DesktopHero({ onEarlyAccess, onExplore }) {
  return (
    <section className="pt-16 pb-20 px-6 blueprint-grid">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
            <Monitor className="w-4 h-4" /> The Desktop IDE Built for Base44 Developers
          </span>
          <h1 className="font-sora font-bold text-4xl md:text-6xl tracking-tight mt-5 mb-6">
            Build, test, audit, and ship Base44 apps from <span className="text-gradient-orange">one powerful desktop workspace.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-3">
            Base44 Desktop brings your projects, prompts, backend resources, integrations, audits, testing, logs, and deployment tools into one organized command center.
          </p>
          <p className="text-muted-foreground mb-8">
            Stop jumping between browser tabs, terminals, documentation, project folders, and disconnected tools. Manage the complete Base44 development lifecycle from one desktop application.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Button
              size="lg"
              onClick={() => { trackEvent("cta_download_free", { location: "hero" }); onEarlyAccess(); }}
              className="font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90 glow-orange"
            >
              Download Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => { trackEvent("cta_explore_features", { location: "hero" }); onExplore(); }}>
              Explore the Features
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Free desktop app. Optional Pro access unlocks all prompts, audits, agent testing, and skills for $25/mo or a one-time $240.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="mt-14">
          <img src={HERO_IMAGE} alt="Base44 Desktop IDE — development command center" className="rounded-2xl border border-border glow-orange w-full" />
          <p className="text-sm text-muted-foreground mt-5 max-w-2xl mx-auto">
            <span className="text-foreground font-semibold">Your Base44 development command center.</span>{" "}
            Browse every project you can access, manage backend resources, improve prompts, run security audits, simulate real users, and prepare applications for production—all without leaving the desktop app.
          </p>
        </motion.div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Built for:</p>
          <p className="text-sm text-muted-foreground">{AUDIENCES.join(" · ")}</p>
        </div>
      </div>
    </section>
  );
}