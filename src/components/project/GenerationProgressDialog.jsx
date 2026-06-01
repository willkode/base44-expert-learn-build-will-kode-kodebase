import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, Sparkles, Circle } from "lucide-react";

// Ordered stages that mirror the backend agent chain.
const STAGES = [
  "Architecture",
  "Entity plan",
  "Permissions",
  "Pages",
  "Workflows",
  "Backend functions",
  "Integrations",
  "Prompt pack",
  "Security review",
  "QA checklist",
];

export default function GenerationProgressDialog({ open, progress }) {
  const { completed = 0, total = STAGES.length, currentAgent } = progress || {};
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md bg-card border-border [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-sora flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generating Blueprint
          </DialogTitle>
          <DialogDescription>
            Our AI architects are building your full app plan. This usually takes a couple of minutes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {total > 0 ? `Stage ${Math.min(completed + 1, total)} of ${total}` : ""}
              </span>
              <span className="font-semibold text-primary">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>{currentAgent ? `Running ${currentAgent}...` : "Starting up..."}</span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pt-1">
            {STAGES.map((label, idx) => {
              const isDone = idx < completed;
              const isActive = idx === completed;
              return (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={isDone ? "text-foreground" : isActive ? "text-primary font-medium" : "text-muted-foreground"}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}