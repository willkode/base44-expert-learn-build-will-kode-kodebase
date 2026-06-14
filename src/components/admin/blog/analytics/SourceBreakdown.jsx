import React from "react";

const COLORS = {
  search: "#facc15",
  social: "#fb923c",
  referral: "#f87171",
  direct: "#60a5fa",
  other: "#94a3b8",
};

// Horizontal-bar breakdown of traffic sources.
export default function SourceBreakdown({ sources }) {
  const total = (sources || []).reduce((a, s) => a + (s.count || 0), 0) || 1;
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6">
      <h3 className="font-sora font-semibold text-sm mb-4">Traffic sources</h3>
      {(!sources || sources.length === 0) ? (
        <p className="text-sm text-muted-foreground">No traffic recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {sources.map((s) => {
            const pct = Math.round((s.count / total) * 100);
            return (
              <div key={s.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="capitalize">{s.name}</span>
                  <span className="text-muted-foreground">{s.count.toLocaleString()} · {pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[s.name] || COLORS.other }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}