import React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function GenerationProgress({ progress }) {
  if (!progress) return null;

  const { completed = 0, total = 0, currentAgent } = progress;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-sora font-semibold text-sm">Generating Blueprint</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {total > 0 ? `Stage ${Math.min(completed + 1, total)} of ${total}` : ""}
        </span>
      </div>

      <Progress value={pct} className="h-2" />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        <span>
          {currentAgent ? `Running ${currentAgent}...` : "Starting up..."}
        </span>
      </div>
    </div>
  );
}