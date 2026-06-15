import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import SecurityBadge from "@/components/admin/security/SecurityBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEVERITY_STYLES, ISSUE_STATUS_STYLES, SEVERITY_ORDER, formatDate } from "@/components/admin/security/securityConfig";

const STATUS_OPTIONS = ["All", "Open", "In Progress", "Fixed", "Needs Retest", "Ignored", "False Positive"];
const SEVERITY_OPTIONS = ["All", ...SEVERITY_ORDER];

export default function IssuesTab({ issues }) {
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");

  const filtered = issues
    .filter((i) => severity === "All" || i.severity === severity)
    .filter((i) => status === "All" || i.status === status)
    .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));

  if (issues.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No security issues yet"
        description="Once you run a scan, any issues found will be listed here with severity, location, and a recommended fix."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            {SEVERITY_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} of {issues.length}</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No issues match these filters" description="Try adjusting the severity or status filters." />
      ) : (
        <div className="space-y-3">
          {filtered.map((issue) => (
            <div key={issue.id} className="rounded-xl border border-border bg-card/70 p-5">
              <div className="flex items-start gap-3 mb-2">
                <SecurityBadge label={issue.severity} styleMap={SEVERITY_STYLES} />
                <SecurityBadge label={issue.status} styleMap={ISSUE_STATUS_STYLES} />
                <span className="text-xs text-muted-foreground ml-auto">{formatDate(issue.created_date)}</span>
              </div>
              <h4 className="font-sora font-semibold text-base mb-1">{issue.title || "Untitled issue"}</h4>
              {issue.description && <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>}
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <span><span className="text-foreground/70">Category:</span> {issue.category}</span>
                {issue.affected_route && <span><span className="text-foreground/70">Route:</span> {issue.affected_route}</span>}
                {issue.affected_entity && <span><span className="text-foreground/70">Entity:</span> {issue.affected_entity}</span>}
                {issue.location && <span><span className="text-foreground/70">Location:</span> {issue.location}</span>}
              </div>
              {issue.recommended_fix && (
                <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                  <span className="text-foreground/80 font-medium">Recommended fix: </span>{issue.recommended_fix}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}