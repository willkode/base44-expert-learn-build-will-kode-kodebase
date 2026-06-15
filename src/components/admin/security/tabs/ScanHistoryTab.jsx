import React from "react";
import { History } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import SecurityBadge from "@/components/admin/security/SecurityBadge";
import { SCAN_STATUS_STYLES, scoreColor, formatDate } from "@/components/admin/security/securityConfig";

export default function ScanHistoryTab({ scans }) {
  if (scans.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No scans yet"
        description="Run your first security scan from the Overview tab. Every scan is recorded here with its score and findings."
      />
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card/70 overflow-hidden">
      <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
        <span className="col-span-3">Date</span>
        <span className="col-span-2">Type</span>
        <span className="col-span-2">Status</span>
        <span className="col-span-1 text-center">Score</span>
        <span className="col-span-2 text-center">Critical / High</span>
        <span className="col-span-2 text-center">Passed / Total</span>
      </div>
      {scans.map((scan) => (
        <div key={scan.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 text-sm items-center border-b border-border last:border-0">
          <span className="col-span-3 text-muted-foreground">{formatDate(scan.completed_at || scan.started_at)}</span>
          <span className="col-span-2">{scan.scan_type}</span>
          <span className="col-span-2"><SecurityBadge label={scan.status} styleMap={SCAN_STATUS_STYLES} /></span>
          <span className={`col-span-1 text-center font-sora font-bold ${scoreColor(scan.overall_score)}`}>
            {scan.overall_score != null ? Math.round(scan.overall_score) : "—"}
          </span>
          <span className="col-span-2 text-center text-muted-foreground">
            <span className="text-red-400">{scan.critical_count || 0}</span> / <span className="text-orange-400">{scan.high_count || 0}</span>
          </span>
          <span className="col-span-2 text-center text-muted-foreground">{scan.passed_checks || 0} / {scan.total_checks || 0}</span>
        </div>
      ))}
    </div>
  );
}