import React from "react";
import { Instagram, AlertTriangle } from "lucide-react";

// Shown when no Instagram professional account is connected, plus the setup warning.
export default function InstagramEmptyState() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card/60 p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-3">
          <Instagram className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm text-foreground max-w-md mx-auto">
          Connect an Instagram professional account to schedule and publish images, videos, Reels,
          Stories, and carousel posts where supported.
        </p>
      </div>
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400 flex items-start gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        Instagram publishing requires a professional Instagram account connected through Meta.
        Personal Instagram accounts may not support API publishing.
      </div>
    </div>
  );
}