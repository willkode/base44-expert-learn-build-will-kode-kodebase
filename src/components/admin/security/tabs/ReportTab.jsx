import React from "react";
import { FileText } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import SecurityBadge from "@/components/admin/security/SecurityBadge";
import { SEVERITY_STYLES, SCAN_STATUS_STYLES, scoreColor, formatDate, SEVERITY_ORDER } from "@/components/admin/security/securityConfig";

export default function ReportTab({ latestScan, issues, counts }) {
  if (!latestScan) {
    return (
      <EmptyState
        icon={FileText}
        title="No report available"
        description="Run a security scan to generate a full report with score, findings, and recommendations."
      />
    );
  }

  const bySeverity = SEVERITY_ORDER.map((sev) => ({
    sev,
    count: issues.filter((i) => i.severity === sev).length,
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card/70 p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="font-sora font-bold text-xl mb-1">Security Report</h3>
            <p className="text-sm text-muted-foreground">
              {latestScan.scan_type} scan · {formatDate(latestScan.completed_at || latestScan.started_at)}
            </p>
          </div>
          <SecurityBadge label={latestScan.status} styleMap={SCAN_STATUS_STYLES} />
        </div>

        <div className="flex items-end gap-3 mb-6">
          <span className={`font-sora font-extrabold text-5xl ${scoreColor(latestScan.overall_score)}`}>
            {latestScan.overall_score != null ? Math.round(latestScan.overall_score) : "—"}
          </span>
          <span className="text-muted-foreground mb-1.5">/ 100 overall score</span>
        </div>

        {latestScan.summary && <p className="text-sm text-muted-foreground mb-6">{latestScan.summary}</p>}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {bySeverity.map(({ sev, count }) => (
            <div key={sev} className="rounded-xl border border-border bg-background/40 p-4 text-center">
              <div className="font-sora font-bold text-2xl mb-1">{count}</div>
              <SecurityBadge label={sev} styleMap={SEVERITY_STYLES} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card/70 p-5 text-center">
          <div className="font-sora font-bold text-2xl text-green-400">{latestScan.passed_checks || 0}</div>
          <p className="text-sm text-muted-foreground mt-1">Checks Passed</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-5 text-center">
          <div className="font-sora font-bold text-2xl text-red-400">{latestScan.failed_checks || 0}</div>
          <p className="text-sm text-muted-foreground mt-1">Checks Failed</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-5 text-center">
          <div className="font-sora font-bold text-2xl">{counts.open}</div>
          <p className="text-sm text-muted-foreground mt-1">Open Issues</p>
        </div>
      </div>
    </div>
  );
}