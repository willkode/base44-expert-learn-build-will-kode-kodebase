import React from "react";
import SecurityBadge from "@/components/admin/security/SecurityBadge";
import { SEVERITY_STYLES, ISSUE_STATUS_STYLES, scoreColor } from "@/components/admin/security/securityConfig";
import { CLIENT_SUMMARY, REPORT_DISCLAIMER, SCORE_BANDS } from "@/components/admin/security/report/reportBuilder";

function Stat({ value, label }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4 text-center">
      <div className="font-sora font-bold text-2xl mb-1">{value}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h3 className="font-sora font-bold text-lg border-b border-border pb-2 mb-4 mt-8">{children}</h3>;
}

// On-screen, export-friendly rendering of the report model.
export default function ReportDocument({ model }) {
  const sev = model.bySeverity;
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-2">
        <h2 className="font-sora font-extrabold text-2xl">Security Audit Report</h2>
        <p className="text-sm text-muted-foreground mt-1">Generated {new Date().toLocaleString()}</p>
      </div>

      {/* Executive Summary */}
      <SectionTitle>Executive Summary</SectionTitle>
      <p className="text-sm text-muted-foreground mb-3">Scan Date: {model.scanDate}</p>
      <div className="flex items-end gap-3 mb-4">
        <span className={`font-sora font-extrabold text-5xl ${scoreColor(model.score)}`}>{model.score != null ? model.score : "—"}</span>
        <span className="text-muted-foreground mb-1.5">/ 100</span>
        <span className="ml-2 mb-1.5"><SecurityBadge label={model.label} styleMap={{
          "Launch Ready": "bg-green-500/15 text-green-400 border-green-500/30",
          "Mostly Secure": "bg-green-500/15 text-green-400 border-green-500/30",
          "Needs Review": "bg-amber-500/15 text-amber-400 border-amber-500/30",
          "High Risk": "bg-orange-500/15 text-orange-400 border-orange-500/30",
          "Critical Risk": "bg-red-500/15 text-red-400 border-red-500/30",
          "Not Scored": "bg-slate-500/15 text-slate-300 border-slate-500/30",
        }} /></span>
      </div>
      <p className="text-sm text-foreground/80 bg-background/40 border border-border rounded-xl p-4">{CLIENT_SUMMARY}</p>

      {/* Scope */}
      <SectionTitle>Scope Reviewed</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <Stat value={model.scope.routesReviewed} label="Routes Reviewed" />
        <Stat value={model.scope.entitiesReviewed} label="Entities Reviewed" />
        <Stat value={model.scope.rolesReviewed} label="Roles Reviewed" />
      </div>

      {/* Issues by Severity / Status */}
      <SectionTitle>Issues by Severity</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Stat value={sev.Critical || 0} label="Critical" />
        <Stat value={sev.High || 0} label="High" />
        <Stat value={sev.Medium || 0} label="Medium" />
        <Stat value={sev.Low || 0} label="Low" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat value={model.byStatus.fixed} label="Fixed" />
        <Stat value={model.byStatus.open} label="Open" />
        <Stat value={model.byStatus.needsRetest} label="Needs Retest" />
      </div>

      {/* Recommended Fix Order */}
      {model.fixOrder.length > 0 && (
        <>
          <SectionTitle>Recommended Fix Order</SectionTitle>
          <ol className="space-y-3">
            {model.fixOrder.map((bucket, idx) => (
              <li key={bucket.label} className="rounded-xl border border-border bg-background/40 p-4">
                <p className="font-semibold text-sm mb-2">{idx + 1}. {bucket.label} <span className="text-muted-foreground">({bucket.issues.length})</span></p>
                <ul className="list-disc pl-5 space-y-1">
                  {bucket.issues.map((i) => <li key={i.id} className="text-sm text-muted-foreground">{i.title}</li>)}
                </ul>
              </li>
            ))}
          </ol>
        </>
      )}

      {/* Issue Summaries */}
      {model.issues.length > 0 && (
        <>
          <SectionTitle>Issue Summaries</SectionTitle>
          <div className="space-y-3">
            {model.issues.map((i) => (
              <div key={i.id} className="rounded-xl border border-border bg-background/40 p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <SecurityBadge label={i.severity} styleMap={SEVERITY_STYLES} />
                  <span className="font-semibold text-sm">{i.title}</span>
                  <SecurityBadge label={i.status} styleMap={ISSUE_STATUS_STYLES} />
                </div>
                <p className="text-xs text-muted-foreground mb-1">Category: {i.category}{i.location ? ` · Location: ${i.location}` : ""}</p>
                {i.risk_summary && <p className="text-sm text-muted-foreground"><span className="text-foreground/80">Risk:</span> {i.risk_summary}</p>}
                {i.recommended_fix && <p className="text-sm text-muted-foreground"><span className="text-foreground/80">Recommended fix:</span> {i.recommended_fix}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Retest Checklist */}
      {model.retestItems.length > 0 && (
        <>
          <SectionTitle>Retest Checklist</SectionTitle>
          <ul className="space-y-2">
            {model.retestItems.map((i) => (
              <li key={i.id} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 inline-block w-4 h-4 border border-muted-foreground rounded-sm shrink-0" />
                <span className="text-muted-foreground">{i.title} <span className="text-foreground/60">({i.severity})</span></span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Score Interpretation */}
      <SectionTitle>Score Interpretation</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-2">
        {SCORE_BANDS.map((b) => (
          <div key={b.range} className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-4 py-2 text-sm">
            <span className="text-muted-foreground">{b.range}</span>
            <span className="font-medium">{b.label}</span>
          </div>
        ))}
      </div>

      {/* Final Notes */}
      <SectionTitle>Final Notes</SectionTitle>
      <p className="text-sm text-muted-foreground border-l-2 border-muted-foreground/50 bg-background/40 rounded-r-lg p-4">{REPORT_DISCLAIMER}</p>
    </div>
  );
}