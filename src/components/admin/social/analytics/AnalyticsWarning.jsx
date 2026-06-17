import React from "react";
import { Info } from "lucide-react";

export default function AnalyticsWarning() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
      <p className="text-xs text-amber-200/90 leading-relaxed">
        Some analytics depend on account type, permissions, API availability, and app review
        approval. Metrics may be partial or unavailable for certain platforms or post types until
        the required access is granted.
      </p>
    </div>
  );
}