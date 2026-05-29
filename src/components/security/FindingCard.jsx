import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import SeverityBadge from "@/components/blueprint/SeverityBadge";

const STATUS_STYLES = {
  open: "bg-destructive/15 text-destructive",
  reviewed: "bg-chart-2/15 text-chart-2",
  resolved: "bg-green-500/15 text-green-400",
};

export default function FindingCard({ finding, onUpdate }) {
  const setStatus = async (fixedStatus) => {
    await base44.entities.SecurityFinding.update(finding.id, { fixedStatus });
    onUpdate();
  };

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-5">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={finding.severity} />
          <span className="font-medium text-sm">{finding.area}</span>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[finding.fixedStatus] || STATUS_STYLES.open}`}>
          {finding.fixedStatus}
        </span>
      </div>

      {finding.issue && <p className="text-sm text-foreground/90 mb-1.5"><span className="text-muted-foreground">Issue: </span>{finding.issue}</p>}
      {finding.risk && <p className="text-sm text-foreground/90 mb-1.5"><span className="text-muted-foreground">Risk: </span>{finding.risk}</p>}
      {finding.recommendation && <p className="text-sm text-foreground/90 mb-4"><span className="text-muted-foreground">Fix: </span>{finding.recommendation}</p>}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setStatus("reviewed")} disabled={finding.fixedStatus === "reviewed"}>
          Mark reviewed
        </Button>
        <Button variant="outline" size="sm" onClick={() => setStatus("resolved")} disabled={finding.fixedStatus === "resolved"}>
          Mark resolved
        </Button>
        {finding.fixedStatus !== "open" && (
          <Button variant="ghost" size="sm" onClick={() => setStatus("open")}>Reopen</Button>
        )}
      </div>
    </div>
  );
}