import React from "react";
import { Sparkles, Target, Palette, MessageSquareText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const reasons = [
  { icon: MessageSquareText, title: "On-brand copy", text: "AI writes in your voice using your words, tone, and CTA." },
  { icon: Target, title: "Audience-aware", text: "Posts speak directly to your audience and their pain points." },
  { icon: Palette, title: "Consistent visuals", text: "Generated images follow your style and brand colors." },
];

export default function BrandEmptyState({ onStart }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f87171]/20 via-[#fb923c]/20 to-[#facc15]/20 flex items-center justify-center mx-auto mb-5">
        <Sparkles className="w-7 h-7 text-primary" />
      </div>
      <h2 className="font-sora font-bold text-2xl mb-2">Set up your Brand Profile</h2>
      <p className="text-muted-foreground max-w-xl mx-auto mb-8">
        Your brand profile is the foundation for AI-generated content. The more you tell us about your brand,
        the more accurate and on-brand every generated post will be.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8 text-left">
        {reasons.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border border-border bg-background/40 p-4">
            <Icon className="w-5 h-5 text-primary mb-2" />
            <h3 className="font-medium text-sm mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
      <Button size="lg" onClick={onStart}>
        Start guided setup <ArrowRight className="w-4 h-4 ml-1.5" />
      </Button>
    </div>
  );
}