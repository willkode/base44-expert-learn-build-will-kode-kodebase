import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Scissors, Sparkles } from "lucide-react";
import { estimateSeconds } from "./longFormOptions";

export default function ScriptPanel({ project, busy, onGenerateScript, onSplitScenes, hasScenes }) {
  const [script, setScript] = useState(project.script || "");

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-sora font-semibold">Narration script</h3>
          <p className="text-sm text-muted-foreground">
            ~{estimateSeconds(script)}s spoken · target {project.target_duration}s
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onGenerateScript} disabled={busy}>
            {busy === "script" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {project.script ? "Regenerate script" : "Generate script"}
          </Button>
          <Button size="sm" onClick={() => onSplitScenes(script)} disabled={busy || !script.trim()}>
            {busy === "scenes" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
            {hasScenes ? "Rebuild scenes" : "Split into scenes"}
          </Button>
        </div>
      </div>

      <Textarea
        rows={8}
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="Generate a script from your brief, or paste your own here."
      />
      {hasScenes && (
        <p className="text-xs text-muted-foreground">
          Rebuilding keeps any scene that already has a storyboard, voice-over or clip — only un-generated scenes are replaced.
        </p>
      )}
    </div>
  );
}