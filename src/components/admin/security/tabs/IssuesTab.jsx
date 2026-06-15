import React, { useState } from "react";
import { ShieldCheck, Route as RouteIcon, Database, Copy, Check } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import SecurityBadge from "@/components/admin/security/SecurityBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEVERITY_STYLES, ISSUE_STATUS_STYLES, SEVERITY_ORDER, formatDate } from "@/components/admin/security/securityConfig";

const STATUS_OPTIONS = ["All", "Open", "In Progress", "Fixed", "Needs Retest", "Ignored", "False Positive"];
const SEVERITY_OPTIONS = ["All", ...SEVERITY_ORDER];
const CATEGORY_OPTIONS = [
  "All", "Route Protection", "Admin Lockdown", "Entity Exposure", "Public Data Leak",
  "User Data Isolation", "Role-Based Access", "Dangerous Action", "Premium Access", "Configuration", "General",
];

function FixPromptButton({ fixPrompt }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(fixPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied fix prompt" : "Copy fix prompt"}
    </button>
  );
}

export default function IssuesTab({ issues }) {
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");

  const filtered = issues
    .filter((i) => severity === "All" || i.severity === severity)
    .filter((i) => status === "All" || i.status === status)
    .filter((i) => category === "All" || i.category === category)
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
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
              <div className="flex items-start gap-2 mb-2 flex-wrap">
                <SecurityBadge label={issue.severity} styleMap={SEVERITY_STYLES} />
                <SecurityBadge label={issue.status} styleMap={ISSUE_STATUS_STYLES} />
                {issue.affected_route && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    <RouteIcon className="w-3 h-3" /> Route · {issue.affected_route}
                  </span>
                )}
                {issue.affected_entity && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
                    <Database className="w-3 h-3" /> Entity · {issue.affected_entity}
                  </span>
                )}
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
              {issue.fix_prompt && <FixPromptButton fixPrompt={issue.fix_prompt} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}