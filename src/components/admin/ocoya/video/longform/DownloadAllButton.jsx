import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadCloud, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const slug = (t) => (t || "project").replace(/\s+/g, "-").toLowerCase();

async function saveFile(url, fileName) {
  const res = await fetch(url);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

export default function DownloadAllButton({ project, scenes }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  const files = scenes
    .slice()
    .sort((a, b) => (a.scene_number || 0) - (b.scene_number || 0))
    .flatMap((s) => {
      const n = String(s.scene_number || 0).padStart(2, "0");
      const out = [];
      if (s.video_url) out.push({ url: s.video_url, name: `${slug(project.title)}-scene-${n}-video.mp4` });
      if (s.audio_url) out.push({ url: s.audio_url, name: `${slug(project.title)}-scene-${n}-voiceover.mp3` });
      return out;
    });

  if (project.final_video_url) {
    files.unshift({ url: project.final_video_url, name: `${slug(project.title)}-final.mp4` });
  }

  const downloadAll = async () => {
    setBusy(true);
    setError(null);
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`${i + 1} of ${files.length}`);
        await saveFile(files[i].url, files[i].name);
        await new Promise((r) => setTimeout(r, 400));
      }
      trackEvent("video_studio_download_all", { files: files.length, project: project.id });
    } catch (e) {
      setError(e.message || "Some files could not be downloaded.");
    }
    setProgress(null);
    setBusy(false);
  };

  return (
    <div className="space-y-1">
      <Button variant="outline" onClick={downloadAll} disabled={busy || files.length === 0}>
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
        {busy ? `Downloading ${progress}…` : `Download all files (${files.length})`}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}