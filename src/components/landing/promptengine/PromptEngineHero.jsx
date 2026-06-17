import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wand2, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { trackCTA } from "@/lib/analytics";

export default function PromptEngineHero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const getStarted = () => {
    const destination = isAuthenticated ? "/tools/prompt-engine" : "/register";
    trackCTA({ text: "Generate My Prompts", location: "prompt_engine_hero", destination });
    navigate(destination);
  };

  const seeHow = () => {
    trackCTA({ text: "See How It Works", location: "prompt_engine_hero", destination: "#how" });
    document.querySelector("#how")?.scrollIntoView({ behavior: "smooth" });
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
            <Wand2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">The KodeBase Prompt Engine</span>
          </div>

          <h1 className="font-sora font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-6">
            Turn one app idea into a
            <br />
            <span className="text-gradient-orange">complete prompt pack</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-9 max-w-2xl mx-auto">
            Chat through your idea and get an ordered set of production-grade build, QA, and security prompts —
            sequenced foundation-first and ready to paste straight into Base44. No more guessing what to prompt next.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Button
              onClick={getStarted}
              size="lg"
              className="bg-primary hover:bg-red-500 text-primary-foreground font-semibold text-base px-7 py-6 shadow-lg shadow-red-600/30 group transition-transform hover:-translate-y-0.5"
            >
              Generate My Prompts
              <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={seeHow}
              size="lg"
              variant="outline"
              className="font-semibold text-base px-7 py-6 border-border hover:bg-secondary/50"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              See How It Works
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground mt-10">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Ready in minutes
            </span>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <span>One-time $10 unlock</span>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <span>Saved to your account forever</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}