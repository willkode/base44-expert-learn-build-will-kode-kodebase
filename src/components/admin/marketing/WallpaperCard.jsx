import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Monitor } from "lucide-react";

const WALLPAPER_URL = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/e2f32c44f_generated_image.png";

// Brand desktop wallpaper (1920x1080) with inline preview + download.
export default function WallpaperCard() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(WALLPAPER_URL);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kodebase-wallpaper-1920x1080.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mt-10 rounded-2xl border border-border bg-card/60 overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Monitor className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-sora font-bold text-sm text-foreground">KodeBase Desktop Wallpaper</h3>
            <p className="text-xs text-muted-foreground">1920 × 1080 · PNG</p>
          </div>
        </div>
        <Button onClick={handleDownload} disabled={downloading} className="shrink-0">
          {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Download
        </Button>
      </div>
      <div className="p-6">
        <img
          src={WALLPAPER_URL}
          alt="KodeBase desktop wallpaper preview"
          className="w-full rounded-xl border border-border"
          width={1920}
          height={1080}
        />
      </div>
    </div>
  );
}