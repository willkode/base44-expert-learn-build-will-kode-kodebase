import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StartBlueprintCard() {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card/70 p-8 blueprint-grid">
      <div className="relative max-w-xl">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center glow-orange mb-4">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
        <h3 className="font-sora font-bold text-xl md:text-2xl mb-2">Start a new blueprint</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Describe your app idea and let the AI architect plan entities, pages, permissions, workflows, and ready-to-use Base44 build prompts.
        </p>
        <Button onClick={() => navigate("/projects/new")} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          Create New Base44 Blueprint <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}