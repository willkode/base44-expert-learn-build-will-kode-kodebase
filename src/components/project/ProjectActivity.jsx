import React from "react";
import { format } from "date-fns";
import { Activity, CheckCircle2, XCircle, Clock } from "lucide-react";

const ICONS = {
  success: { icon: CheckCircle2, color: "text-green-400" },
  failed: { icon: XCircle, color: "text-destructive" },
  pending: { icon: Clock, color: "text-chart-2" },
};

export default function ProjectActivity({ runs, projectStatus }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6">
      <h3 className="font-sora font-semibold text-lg mb-4">Activity</h3>
      {runs.length === 0 ? (
        <div className="flex items-center gap-3 text-sm text-muted-foreground py-4">
          <Activity className="w-5 h-5" /> No agent activity yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {runs.map((r) => {
            // If the project already finished, no run can still be pending.
            const effectiveStatus =
              r.status === "pending" && projectStatus === "completed" ? "success" : r.status;
            const meta = ICONS[effectiveStatus] || ICONS.pending;
            const Icon = meta.icon;
            return (
              <li key={r.id} className="flex items-start gap-3">
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${meta.color}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{r.agentName}</p>
                  {r.outputSummary && <p className="text-xs text-muted-foreground line-clamp-2">{r.outputSummary}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.created_date ? format(new Date(r.created_date), "MMM d, yyyy · h:mm a") : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}