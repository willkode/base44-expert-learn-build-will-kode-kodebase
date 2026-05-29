import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getPlan, getBlueprintUsage } from "@/lib/plans";

export default function PlanUsageCard({ profile }) {
  const plan = getPlan(profile?.plan);
  const usage = getBlueprintUsage(profile);
  const pct = usage.unlimited ? 100 : Math.min(100, Math.round((usage.used / Math.max(1, usage.limit)) * 100));

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Current plan</p>
          <h3 className="font-sora font-bold text-lg">{plan.name}</h3>
        </div>
        {plan.id !== "agency" && (
          <Button asChild size="sm" variant="outline">
            <Link to="/pricing"><Sparkles className="w-4 h-4 mr-2" /> Upgrade</Link>
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Blueprints used</span>
          <span className="font-medium">
            {usage.used}{usage.unlimited ? "" : ` / ${usage.limit}`}
            {usage.unlimited && <span className="text-muted-foreground"> (unlimited)</span>}
          </span>
        </div>
        {!usage.unlimited && <Progress value={pct} className="h-2" />}
      </div>
    </div>
  );
}