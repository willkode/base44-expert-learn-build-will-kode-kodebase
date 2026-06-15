import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, DraftingCompass, FileCode2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackCTA } from "@/lib/analytics";

export default function BlueprintHero() {
  const navigate = useNavigate();

  const getStarted = () => {
    trackCTA({ text: "Build My Blueprint", location: "blueprint_hero", destination: "/register" });
    navigate("/register");
  };

  const seeWhatsInside = () => {
    trackCTA({ text: "See What's Inside", location: "blueprint_hero", destination: "#blueprint" });
    document.querySelector("#blueprint")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden min-h-[88vh] flex items-center">
      <div className="absolute inset-0 blueprint-grid opacity-40" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full bg-primary/15 blur-[140px] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-[1]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-7 backdrop-blur-sm">
            <DraftingCompass className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">The KodeBase Blueprint Tool</span>
          </div>

          <h1 className="font-sora font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-6">
            Plan your entire app
            <br />
            <span className="text-gradient-orange">before you build it</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-9 max-w-2xl mx-auto">
            Describe your idea in plain English and get a complete, builder-ready blueprint — data model,
            roles, permissions, page map, build phases, and copy-paste Base44 prompts. Stop prompting blindly
            and start building from a real plan.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Button
              onClick={getStarted}
              size="lg"
              className="bg-primary hover:bg-red-500 text-primary-foreground font-semibold text-base px-7 py-6 shadow-lg shadow-red-600/30 group transition-transform hover:-translate-y-0.5"
            >
              Build My Blueprint
              <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={seeWhatsInside}
              size="lg"
              variant="outline"
              className="font-semibold text-base px-7 py-6 border-border hover:bg-secondary/50"
            >
              <FileCode2 className="w-4 h-4 mr-1" />
              See What's Inside
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground mt-10">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Ready in minutes
            </span>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <span>No coding required</span>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <span>Built for Base44</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}