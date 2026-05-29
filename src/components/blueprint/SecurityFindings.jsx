import React from "react";
import { ShieldCheck } from "lucide-react";
import SeverityBadge from "./SeverityBadge";

export default function SecurityFindings({ findings }) {
  if (!findings || findings.length === 0) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground py-4">
        <ShieldCheck className="w-5 h-5" /> No security findings recorded yet.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {findings.map((f) => (
        <div key={f.id} className="rounded-xl border border-border bg-background/40 p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="font-medium text-sm">{f.area}</span>
            <SeverityBadge severity={f.severity} />
          </div>
          {f.issue && <p className="text-sm text-foreground/90 mb-1.5"><span className="text-muted-foreground">Issue: </span>{f.issue}</p>}
          {f.risk && <p className="text-sm text-foreground/90 mb-1.5"><span className="text-muted-foreground">Risk: </span>{f.risk}</p>}
          {f.recommendation && <p className="text-sm text-foreground/90"><span className="text-muted-foreground">Fix: </span>{f.recommendation}</p>}
        </div>
      ))}
    </div>
  );
}