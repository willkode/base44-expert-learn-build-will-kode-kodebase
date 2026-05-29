import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StartBlueprintCard() {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card to-secondary/40 p-8 mb-10 blueprint-grid">
      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" /> AI Architect
        </div>
        <h2 className="font-sora font-bold text-2xl md:text-3xl mb-2">Start a new blueprint</h2>
        <p className="text-muted-foreground mb-6">
          Describe your app idea and get a complete, production-ready Base44 architecture plan — entities, pages, permissions, workflows, and build prompts.
        </p>
        <Button
          onClick={() => navigate("/projects/new")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-orange"
        >
          Create New Base44 Blueprint <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}