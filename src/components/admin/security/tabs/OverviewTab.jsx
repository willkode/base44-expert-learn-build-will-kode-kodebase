import React from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon, CheckCircle2, RefreshCw, ScanLine, History, ListChecks, XCircle } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import SecurityBadge from "@/components/admin/security/SecurityBadge";
import { SEVERITY_STYLES, ISSUE_STATUS_STYLES, SCAN_STATUS_STYLES, scoreColor, formatDate } from "@/components/admin/security/securityConfig";
import { scoreLabel } from "@/components/admin/security/scanEngine";
import ScoreBanner from "@/components/admin/security/notifications/ScoreBanner";

function ScanButton({ onScanNow, scanning, scanState }) {
  const map = {
    ready: { label: "Run Security Scan", icon: ScanLine, cls: "bg-primary hover:bg-primary/90 text-primary-foreground" },
    running: { label: "Scanning App Security...", icon: RefreshCw, spin: true, cls: "bg-primary text-primary-foreground" },
    complete: { label: "Scan Complete", icon: CheckCircle2, cls: "bg-green-500/90 hover:bg-green-500 text-white" },
    failed: { label: "Scan Failed — View Details", icon: XCircle, cls: "bg-red-500/90 hover:bg-red-500 text-white" },
  };
  const s = scanning ? map.running : (map[scanState] || map.ready);
  const Icon = s.icon;
  return (
    <button
      onClick={onScanNow}
      disabled={scanning}
      className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-80 transition-colors ${s.cls}`}
    >
      <Icon className={`w-4 h-4 ${s.spin ? "animate-spin" : ""}`} />
      {s.label}
    </button>
  );
}

function MetricCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-primary" />
          </div>
        )}
      </div>
      <div className={`font-sora font-bold text-3xl ${accent || ""}`}>{value}</div>
    </div>
  );
}

const CATEGORY_GROUPS = [
  { key: "entity", label: "Entity Exposure", cats: ["Entity Exposure", "Public Data Leak", "User Data Isolation"] },
  { key: "route", label: "Route Protection", cats: ["Route Protection", "Admin Lockdown"] },
  { key: "role", label: "Roles & Actions", cats: ["Role-Based Access", "Dangerous Action", "Premium Access"] },
];

export default function OverviewTab({ scans, issues, latestScan, counts, onScanNow, scanning, scanState }) {
  const hasScans = scans.length > 0;
  const recentIssues = issues.slice(0, 6);
  const recentScans = scans.slice(0, 5);
  const openIssues = issues.filter((i) => i.status === "Open");
  const groupCounts = CATEGORY_GROUPS.map((g) => ({
    ...g,
    count: openIssues.filter((i) => g.cats.includes(i.category)).length,
  }));

  return (
    <div className="space-y-8">
      {/* Score-based alert banner */}
      <ScoreBanner score={latestScan?.overall_score} />

      {/* Top row: score + scan action */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/70 p-6 flex items-center justify-between gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Overall Security Score</p>
            <div className="flex items-end gap-3">
              <span className={`font-sora font-extrabold text-5xl ${scoreColor(latestScan?.overall_score)}`}>
                {latestScan?.overall_score != null ? Math.round(latestScan.overall_score) : "—"}
              </span>
              {latestScan?.overall_score != null && <span className="text-muted-foreground mb-1.5">/ 100</span>}
            </div>
            {latestScan?.overall_score != null && (
              <p className={`text-sm font-semibold mt-1 ${scoreColor(latestScan.overall_score)}`}>
                {scoreLabel(latestScan.overall_score)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Last scan: {latestScan ? formatDate(latestScan.completed_at || latestScan.started_at) : "Never"}
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/70 p-6 flex flex-col justify-center items-start">
          <p className="text-sm text-muted-foreground mb-3">Run a fresh security scan across routes, entities, and roles.</p>
          <ScanButton onScanNow={onScanNow} scanning={scanning} scanState={scanState} />
        </div>
      </div>

      {/* Counts */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard icon={ListChecks} label="Total Open" value={counts.open} />
        <MetricCard icon={AlertOctagon} label="Critical" value={counts.critical} accent="text-red-400" />
        <MetricCard icon={ShieldAlert} label="High" value={counts.high} accent="text-orange-400" />
        <MetricCard icon={AlertTriangle} label="Medium" value={counts.medium} accent="text-amber-400" />
        <MetricCard icon={AlertTriangle} label="Low" value={counts.low} accent="text-blue-400" />
        <MetricCard icon={CheckCircle2} label="Fixed" value={counts.fixed} accent="text-green-400" />
      </div>

      {/* Issues by area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {groupCounts.map((g) => (
          <div key={g.key} className="rounded-2xl border border-border bg-card/70 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{g.label}</p>
              <p className={`font-sora font-bold text-2xl ${g.count > 0 ? "text-orange-400" : "text-green-400"}`}>{g.count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">open issue{g.count === 1 ? "" : "s"}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {g.key === "entity" ? <ShieldAlert className="w-5 h-5 text-primary" /> : g.key === "route" ? <ScanLine className="w-5 h-5 text-primary" /> : <ShieldCheck className="w-5 h-5 text-primary" />}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent issues */}
        <div className="rounded-2xl border border-border bg-card/70 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-sora font-semibold text-lg">Recent Issues</h3>
            {counts.needsRetest > 0 && (
              <span className="text-xs text-muted-foreground">{counts.needsRetest} need retest</span>
            )}
          </div>
          {recentIssues.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No issues found"
              description="Run a scan to surface security issues across your app."
            />
          ) : (
            <div className="space-y-3">
              {recentIssues.map((issue) => (
                <div key={issue.id} className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-3.5">
                  <SecurityBadge label={issue.severity} styleMap={SEVERITY_STYLES} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{issue.title || "Untitled issue"}</p>
                    <p className="text-xs text-muted-foreground truncate">{issue.category}{issue.affected_route ? ` · ${issue.affected_route}` : ""}</p>
                  </div>
                  <SecurityBadge label={issue.status} styleMap={ISSUE_STATUS_STYLES} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent scan history */}
        <div className="rounded-2xl border border-border bg-card/70 p-6">
          <h3 className="font-sora font-semibold text-lg mb-5">Recent Scan History</h3>
          {!hasScans ? (
            <EmptyState
              icon={History}
              title="No scans yet"
              description="Your scan history will appear here after your first security scan."
            />
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3.5">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <ScanLine className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{scan.scan_type} scan</p>
                    <p className="text-xs text-muted-foreground">{formatDate(scan.completed_at || scan.started_at)}</p>
                  </div>
                  <span className={`font-sora font-bold text-sm ${scoreColor(scan.overall_score)}`}>
                    {scan.overall_score != null ? Math.round(scan.overall_score) : "—"}
                  </span>
                  <SecurityBadge label={scan.status} styleMap={SCAN_STATUS_STYLES} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}