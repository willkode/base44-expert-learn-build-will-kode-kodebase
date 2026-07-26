import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Download, FileJson, Film, Loader2 } from "lucide-react";
import DownloadAllButton from "./DownloadAllButton";
import { trackEvent } from "@/lib/analytics";

export default function RenderPanel({ project, scenes }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const ready = scenes.filter((s) => s.video_url).length;
  const total = scenes.length;

  const build = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    let res;
    try {
      res = await base44.functions.invoke("videoStudioRender", { projectId: project.id });
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Render request failed.");
      setBusy(false);
      return;
    }
    if (res.data?.error) setError(res.data.error);
    else {
      setResult(res.data);
      trackEvent("video_studio_render_submitted", { scenes: total, duration: res.data.manifest?.totalDuration });
    }
    setBusy(false);
  };

  const downloadManifest = () => {
    const blob = new Blob([JSON.stringify(result.manifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "-").toLowerCase()}-render-manifest.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const srt = () =>
    scenes
      .filter((s) => s.video_url)
      .map((s, i) => {
        const start = scenes.slice(0, i).reduce((t, x) => t + (x.video_duration || x.duration_target || 6), 0);
        const end = start + (s.video_duration || s.duration_target || 6);
        const fmt = (t) => new Date(t * 1000).toISOString().substr(11, 12).replace(".", ",");
        return `${i + 1}\n${fmt(start)} --> ${fmt(end)}\n${s.caption_text || s.narration}\n`;
      })
      .join("\n");

  const downloadSrt = () => {
    const blob = new Blob([srt()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "-").toLowerCase()}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div>
        <h3 className="font-sora font-semibold">Final render</h3>
        <p className="text-sm text-muted-foreground">
          {ready} of {total} scenes have clips · ~
          {scenes.reduce((t, s) => t + (s.video_duration || s.duration_target || 6), 0)}s total
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={build} disabled={busy || ready === 0}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />} Build render manifest
        </Button>
        <DownloadAllButton project={project} scenes={scenes} />
        {result && (
          <>
            <Button variant="outline" onClick={downloadManifest}><FileJson className="w-4 h-4" /> Download manifest</Button>
            <Button variant="outline" onClick={downloadSrt}><Download className="w-4 h-4" /> Download captions (SRT)</Button>
          </>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm space-y-1">
          <p className="font-medium text-foreground">Manifest ready — {result.manifest.totalDuration}s, {result.manifest.clips.length} clips</p>
          {!result.providerConfigured && (
            <p className="text-muted-foreground">{result.message}</p>
          )}
          {project.final_video_url && (
            <a href={project.final_video_url} download className="underline text-primary">Download final MP4</a>
          )}
        </div>
      )}

      {!result && (
        <p className="text-xs text-muted-foreground">
          Scenes are generated individually and stitched by an external render service. Until a render key is added you can
          download every clip plus the manifest and captions.
        </p>
      )}
    </div>
  );
}