import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle, ArrowDown, ArrowUp, Check, Download, Image as ImageIcon,
  Loader2, Lock, Mic, Trash2, Unlock, Video,
} from "lucide-react";
import { MAX_SCENE_SECONDS, SCENE_STATUS_LABELS, estimateSeconds } from "./longFormOptions";

export default function SceneCard({
  scene, busy, isFirst, isLast,
  onChange, onPersist, onGenerate, onShorten, onMove, onApprove, onToggleLock, onDelete,
}) {
  const estimate = estimateSeconds(scene.narration);
  const tooLong = estimate > MAX_SCENE_SECONDS;
  const spin = (kind) => busy === kind;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">
          {scene.scene_number}
        </span>
        <span className="font-sora font-semibold text-sm">{scene.title}</span>
        <Badge variant={scene.status === "FAILED" ? "destructive" : "secondary"}>
          {SCENE_STATUS_LABELS[scene.status] || scene.status}
        </Badge>
        {scene.approval_status === "approved" && <Badge className="gap-1"><Check className="w-3 h-3" /> Approved</Badge>}
        <span className="text-xs text-muted-foreground ml-auto">
          voice ~{scene.audio_duration || estimate}s · clip {scene.video_duration || scene.duration_target}s
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <div className="space-y-2">
          {scene.video_url ? (
            <video src={scene.video_url} controls className="w-full rounded-xl border border-border bg-black" />
          ) : scene.storyboard_url ? (
            <img src={scene.storyboard_url} alt={`Scene ${scene.scene_number} storyboard`} className="w-full rounded-xl border border-border" />
          ) : (
            <div className="aspect-[9/16] max-h-52 w-full rounded-xl border border-dashed border-border bg-secondary/40 flex items-center justify-center text-xs text-muted-foreground text-center px-3">
              No storyboard or clip yet
            </div>
          )}
          {scene.audio_url && <audio src={scene.audio_url} controls className="w-full" />}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Narration</p>
            <Textarea
              rows={3}
              value={scene.narration}
              onChange={(e) => onChange({ ...scene, narration: e.target.value })}
              onBlur={onPersist}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Visual prompt</p>
            <Textarea
              rows={3}
              value={scene.visual_prompt}
              onChange={(e) => onChange({ ...scene, visual_prompt: e.target.value })}
              onBlur={onPersist}
            />
          </div>

          {tooLong && (
            <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs space-y-2">
              <p className="flex items-center gap-1.5 font-medium text-yellow-300">
                <AlertTriangle className="w-3.5 h-3.5" /> Narration is ~{estimate}s — over the {MAX_SCENE_SECONDS}s scene limit.
              </p>
              <Button size="sm" variant="outline" onClick={onShorten} disabled={spin("shorten")}>
                {spin("shorten") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Shorten narration automatically
              </Button>
            </div>
          )}

          {scene.error_message && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs">
              <p className="font-medium text-destructive mb-1">This scene failed to generate</p>
              <p className="text-muted-foreground">{scene.error_message}</p>
              <p className="text-muted-foreground mt-1">Edit the prompt above and retry — other scenes are unaffected.</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={() => onGenerate("storyboard")} disabled={!!busy}>
              {spin("storyboard") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
              {scene.storyboard_url ? "Redo storyboard" : "Storyboard"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => onGenerate("voice")} disabled={!!busy || tooLong}>
              {spin("voice") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mic className="w-3.5 h-3.5" />}
              {scene.audio_url ? "Redo voice" : "Voice"}
            </Button>
            <Button size="sm" onClick={() => onGenerate("video")} disabled={!!busy}>
              {spin("video") ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}
              {scene.video_url ? "Regenerate clip" : "Generate clip"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onApprove} disabled={!scene.video_url}>
              <Check className="w-3.5 h-3.5" /> {scene.approval_status === "approved" ? "Unapprove" : "Approve"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onToggleLock}>
              {scene.is_locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              {scene.is_locked ? "Locked" : "Lock"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onMove(-1)} disabled={isFirst}><ArrowUp className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="ghost" onClick={() => onMove(1)} disabled={isLast}><ArrowDown className="w-3.5 h-3.5" /></Button>
            {scene.video_url && (
              <Button size="sm" variant="ghost" asChild>
                <a href={scene.video_url} download={`scene-${scene.scene_number}.mp4`}><Download className="w-3.5 h-3.5" /> Download</a>
              </Button>
            )}
            <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          {(scene.revisions || []).length > 1 && (
            <p className="text-xs text-muted-foreground">
              {scene.revisions.length} revisions kept —{" "}
              {scene.revisions.map((r, i) => (
                <a key={i} href={r.video_url} target="_blank" rel="noreferrer" className="underline mr-2">v{r.revision_number}</a>
              ))}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}