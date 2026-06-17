import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { trackCTA } from "@/lib/analytics";

export default function PromptEngineCTA() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const getStarted = () => {
    const destination = isAuthenticated ? "/tools/prompt-engine" : "/register";
    trackCTA({ text: "Start Generating", location: "prompt_engine_cta", destination });
    navigate(destination);
  };

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full bg-primary/15 blur-[140px] pointer-events-none" />
      <div className="relative max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 mb-6">
          <Wand2 className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight mb-5">
          Stop prompting blindly.
          <br />
          <span className="text-gradient-orange">Start from a real plan.</span>
        </h2>
        <p className="text-muted-foreground text-base md:text-lg mb-9 max-w-xl mx-auto">
          Describe your idea and get an ordered prompt pack you can paste straight into Base44 — saved to your account forever.
        </p>
        <Button
          onClick={getStarted}
          size="lg"
          className="bg-primary hover:bg-red-500 text-primary-foreground font-semibold text-base px-8 py-6 shadow-lg shadow-red-600/30 group transition-transform hover:-translate-y-0.5"
        >
          Start Generating
          <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  );
}