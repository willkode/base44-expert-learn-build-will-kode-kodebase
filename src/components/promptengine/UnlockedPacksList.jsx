import React from "react";
import { format } from "date-fns";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shows the user's previously-unlocked (paid) Prompt Engine packs so they can
// always come back and copy their prompts. Purely a navigation list — no logic change.
export default function UnlockedPacksList({ sessions = [], onOpen }) {
  const unlocked = sessions.filter((s) => s.unlocked && s.generated_prompt_count > 0);
  if (unlocked.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <h2 className="font-sora font-semibold text-sm">Your unlocked prompt packs</h2>
      </div>
      <div className="space-y-2.5">
        {unlocked.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/30 p-3.5 hover:border-primary/40 transition-colors"
          >
            <div className="min-w-0">
              <p className="font-sora font-semibold text-sm truncate">{s.app_name || s.title || "Prompt Pack"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {s.generated_prompt_count || 0} prompts
                {s.unlocked_at ? ` · unlocked ${format(new Date(s.unlocked_at), "MMM d, yyyy")}` : ""}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onOpen(s)} className="shrink-0">
              Open <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}