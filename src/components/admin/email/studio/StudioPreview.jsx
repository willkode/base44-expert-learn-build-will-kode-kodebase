import React, { useState } from "react";
import { Monitor, Smartphone, Code2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudioPreview({ draft }) {
  const [device, setDevice] = useState("desktop");
  const [mode, setMode] = useState("html");

  const hasContent = draft.htmlContent || draft.textContent;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-sora font-semibold">Live preview</h3>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <Button variant={mode === "html" ? "secondary" : "ghost"} size="sm" className="rounded-none" onClick={() => setMode("html")}>
              <Code2 className="w-4 h-4 mr-1.5" /> HTML
            </Button>
            <Button variant={mode === "text" ? "secondary" : "ghost"} size="sm" className="rounded-none" onClick={() => setMode("text")}>
              <Type className="w-4 h-4 mr-1.5" /> Text
            </Button>
          </div>
          {mode === "html" && (
            <div className="flex rounded-lg border border-border overflow-hidden">
              <Button variant={device === "desktop" ? "secondary" : "ghost"} size="icon" className="rounded-none h-8 w-8" onClick={() => setDevice("desktop")}>
                <Monitor className="w-4 h-4" />
              </Button>
              <Button variant={device === "mobile" ? "secondary" : "ghost"} size="icon" className="rounded-none h-8 w-8" onClick={() => setDevice("mobile")}>
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {draft.subject && (
        <div className="rounded-lg bg-secondary/50 p-3 text-sm">
          <p className="font-medium text-foreground">{draft.subject}</p>
          {draft.previewText && <p className="text-muted-foreground text-xs mt-0.5">{draft.previewText}</p>}
        </div>
      )}

      {!hasContent ? (
        <div className="flex items-center justify-center h-64 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
          Generate or write an email to preview it here.
        </div>
      ) : mode === "html" ? (
        <div className="flex justify-center bg-white rounded-lg overflow-hidden">
          <iframe
            title="Email preview"
            srcDoc={draft.htmlContent || "<p style='padding:24px;font-family:sans-serif'>No HTML content</p>"}
            className="border-0 bg-white"
            style={{ width: device === "mobile" ? 375 : "100%", height: 520 }}
          />
        </div>
      ) : (
        <pre className="whitespace-pre-wrap text-sm bg-secondary/40 rounded-lg p-4 h-[520px] overflow-auto">
          {draft.textContent || "No plain-text content"}
        </pre>
      )}
    </div>
  );
}