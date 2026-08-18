import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Download, Monitor } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const DOWNLOAD_URL = "https://drive.google.com/file/d/1bvt0cNBl3ABSyJ4geDwAAS6OW0oS_Wxi/view?usp=sharing";

export default function DesktopDownloadCard() {
  const [license, setLicense] = useState(null);

  useEffect(() => {
    let active = true;
    base44.functions
      .invoke("desktopLicense", { action: "get" })
      .then((res) => { if (active) setLicense(res.data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  if (license?.status !== "active") return null;

  return (
    <section className="rounded-2xl border border-primary/40 bg-card/60 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5 justify-between">
      <div>
        <h2 className="font-sora text-lg font-bold flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary" /> Base44 Desktop IDE is ready to install
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Windows 10 / 11 · x64. Activate it with your account key from Settings.
        </p>
      </div>
      <Button
        asChild
        className="font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
        onClick={() => trackEvent("desktop_ide_download", { location: "dashboard" })}
      >
        <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
          <Download className="w-4 h-4 mr-2" /> Download Base44 Desktop IDE
        </a>
      </Button>
    </section>
  );
}