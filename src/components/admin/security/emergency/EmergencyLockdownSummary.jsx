import React from "react";
import { ShieldAlert, AlertOctagon, Route as RouteIcon, Database, Users, ListChecks, CheckCircle2 } from "lucide-react";
import SecurityBadge from "@/components/admin/security/SecurityBadge";
import CopyFixPromptButton from "@/components/admin/security/issues/CopyFixPromptButton";
import { SEVERITY_STYLES, scoreColor } from "@/components/admin/security/securityConfig";
import { EMERGENCY_WARNING } from "@/components/admin/security/emergencyEngine";

const RETEST_CHECKLIST = [
  "Test each restricted route as a logged-out user (direct URL).",
  "Test each restricted route as a regular authenticated user.",
  "Test as a non-owner user — confirm no access to other users' records.",
  "Test as an admin — confirm admin areas still work.",
  "Confirm restricted navigation and buttons are hidden from unauthorized users.",
];

function Chip({ icon: Icon, items, empty, color }) {
  if (!items || items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((v) => (
        <span key={v} className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs ${color}`}>
          <Icon className="w-3.5 h-3.5" /> {v}
        </span>
      ))}
    </div>
  );
}

export default function EmergencyLockdownSummary({ result, onClose }) {
  const { summary, urgentIssues, score, label } = result;

  return (
    <div className="space-y-6">
      {/* Warning */}
      <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <p className="text-sm text-orange-200/90">{EMERGENCY_WARNING}</p>
      </div>

      {/* Headline counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card/70 p-5">
          <p className="text-sm text-muted-foreground mb-2">Critical Risks</p>
          <p className="font-sora font-bold text-3xl text-red-400">{summary.criticalCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-5">
          <p className="text-sm text-muted-foreground mb-2">High Risks</p>
          <p className="font-sora font-bold text-3xl text-orange-400">{summary.highCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-5">
          <p className="text-sm text-muted-foreground mb-2">Urgent Issues</p>
          <p className="font-sora font-bold text-3xl">{summary.totalUrgent}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-5">
          <p className="text-sm text-muted-foreground mb-2">Security Score</p>
          <p className={`font-sora font-bold text-3xl ${scoreColor(score)}`}>{score}<span className="text-base text-muted-foreground"> · {label}</span></p>
        </div>
      </div>

      {/* Immediate actions */}
      <div className="rounded-2xl border border-border bg-card/70 p-6">
        <h3 className="font-sora font-semibold text-lg mb-4 flex items-center gap-2"><AlertOctagon className="w-5 h-5 text-primary" /> Recommended Immediate Actions</h3>
        <ul className="space-y-2">
          {summary.immediateActions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> {a}
            </li>
          ))}
        </ul>
      </div>

      {/* Scope to review */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card/70 p-5">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2"><RouteIcon className="w-4 h-4 text-primary" /> Routes to Restrict</p>
          <Chip icon={RouteIcon} items={summary.routesToRestrict} empty="No exposed routes found." color="border-primary/30 text-primary" />
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-5">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Database className="w-4 h-4 text-amber-400" /> Entities to Review</p>
          <Chip icon={Database} items={summary.entitiesToReview} empty="No exposed entities found." color="border-amber-500/30 text-amber-400" />
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-5">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /> Roles to Review</p>
          <Chip icon={Users} items={summary.rolesToReview} empty="No role risks found." color="border-border text-muted-foreground" />
        </div>
      </div>

      {/* Fix prompts to copy */}
      <div className="rounded-2xl border border-border bg-card/70 p-6">
        <h3 className="font-sora font-semibold text-lg mb-4">Emergency Fix Prompts to Copy</h3>
        {urgentIssues.length === 0 ? (
          <div className="flex items-center gap-3 text-sm text-green-400">
            <CheckCircle2 className="w-5 h-5" /> No urgent access-control risks were detected.
          </div>
        ) : (
          <div className="space-y-4">
            {urgentIssues.map((issue) => (
              <div key={issue.issue_id} className="rounded-xl border border-border bg-background/40 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <SecurityBadge label={issue.severity} styleMap={SEVERITY_STYLES} />
                      <span className="text-xs text-muted-foreground">{issue.category}</span>
                    </div>
                    <p className="text-sm font-medium">{issue.title}</p>
                    {(issue.affected_route || issue.affected_entity || issue.affected_role) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {issue.affected_route || issue.affected_entity || issue.affected_role}
                      </p>
                    )}
                    {issue.risk_summary && <p className="text-xs text-muted-foreground mt-1">{issue.risk_summary}</p>}
                  </div>
                </div>
                <CopyFixPromptButton fixPrompt={issue.fix_prompt} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Retest checklist */}
      <div className="rounded-2xl border border-border bg-card/70 p-6">
        <h3 className="font-sora font-semibold text-lg mb-4 flex items-center gap-2"><ListChecks className="w-5 h-5 text-primary" /> Retest Checklist</h3>
        <ul className="space-y-2">
          {RETEST_CHECKLIST.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-1 w-4 h-4 rounded border border-border shrink-0" /> {c}
            </li>
          ))}
        </ul>
      </div>

      {onClose && (
        <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground underline">
          Close emergency review
        </button>
      )}
    </div>
  );
}