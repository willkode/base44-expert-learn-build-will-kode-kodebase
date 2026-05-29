import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

// Placeholder upgrade card. No payments yet — links to pricing page.
export default function UpgradeCard({ title = "Upgrade to unlock more", description, suggestedPlan = "Pro" }) {
  return (
    <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-sora font-semibold text-base">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Link to="/pricing"><Sparkles className="w-4 h-4 mr-2" /> Upgrade to {suggestedPlan}</Link>
            </Button>
            <span className="text-xs text-muted-foreground">Payments coming soon.</span>
          </div>
        </div>
      </div>
    </div>
  );
}