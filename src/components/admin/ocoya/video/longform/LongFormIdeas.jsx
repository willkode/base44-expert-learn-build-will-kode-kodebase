import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";

export default function LongFormIdeas({ ideas, loading, error, onUse, onDismiss }) {
  if (!loading && !error && !ideas) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <p className="font-sora font-semibold">AI video project ideas</p>
        </div>
        {onDismiss && <Button size="sm" variant="ghost" onClick={onDismiss}>Hide</Button>}
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Thinking up long-form video concepts…
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && ideas && (
        <div className="grid gap-3 md:grid-cols-2">
          {ideas.map((idea, i) => (
            <div key={i} className="rounded-xl border border-border bg-secondary/30 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-sora font-semibold text-sm">{idea.title}</p>
                <Badge variant="secondary" className="shrink-0">{idea.platform}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{idea.brief}</p>
              <p className="text-xs text-muted-foreground">{idea.target_duration}s · {idea.style_notes}</p>
              <Button size="sm" onClick={() => onUse(idea)}>Use this idea</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}