import React, { useState, useEffect } from "react";
import { Route as RouteIcon, Database, Users as UsersIcon, MapPin, AlertTriangle, ShieldAlert, ClipboardCheck, StickyNote, RefreshCw, ListChecks } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import SecurityBadge from "@/components/admin/security/SecurityBadge";
import CopyFixPromptButton from "@/components/admin/security/issues/CopyFixPromptButton";
import RetestDialog from "@/components/admin/security/issues/RetestDialog";
import { SEVERITY_STYLES, ISSUE_STATUS_STYLES, formatDate } from "@/components/admin/security/securityConfig";
import { updateIssueStatus } from "@/components/admin/security/issues/issueActions";
import { getRetestChecklist } from "@/components/admin/security/retestEngine";

const STATUS_OPTIONS = ["Open", "In Progress", "Fixed", "Needs Retest", "Ignored", "False Positive"];

function Field({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      {Icon && <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
      <div>
        <span className="text-muted-foreground">{label}: </span>
        <span className="text-foreground/90">{value}</span>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-primary" />}
        <h4 className="font-sora font-semibold text-sm">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export default function IssueDetailDrawer({ issue, open, onOpenChange, onChanged }) {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Open");
  const [fpReason, setFpReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [retestOpen, setRetestOpen] = useState(false);

  useEffect(() => {
    if (issue) {
      setNotes(issue.admin_notes || "");
      setStatus(issue.status || "Open");
      setFpReason(issue.false_positive_reason || "");
    }
  }, [issue]);

  if (!issue) return null;

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await base44.entities.SecurityIssue.update(issue.id, { admin_notes: notes });
      toast({ title: "Notes saved" });
      onChanged?.();
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async () => {
    if (status === "False Positive" && !fpReason.trim()) {
      toast({ title: "Reason required", description: "Add a reason before marking this as a false positive.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const extra = status === "False Positive" ? { false_positive_reason: fpReason } : {};
      await updateIssueStatus(issue, status, extra);
      onChanged?.();
      if (status === "Fixed") {
        toast({ title: "Marked as fixed", description: "Run a retest to confirm — set status to Needs Retest if a retest is required." });
      } else {
        toast({ title: "Status updated", description: `Issue set to ${status}.` });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <div className="space-y-5 pb-10">
          {/* Header */}
          <div className="pr-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <SecurityBadge label={issue.severity} styleMap={SEVERITY_STYLES} />
              <SecurityBadge label={issue.status} styleMap={ISSUE_STATUS_STYLES} />
              <span className="inline-flex items-center rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">{issue.category}</span>
            </div>
            <h3 className="font-sora font-bold text-xl">{issue.title || "Untitled issue"}</h3>
          </div>

          {/* Retest + Copy fix prompt — prominent */}
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setRetestOpen(true)} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Retest Issue
            </Button>
            {issue.fix_prompt && <CopyFixPromptButton fixPrompt={issue.fix_prompt} />}
          </div>

          {/* Details */}
          {issue.description && <p className="text-sm text-muted-foreground">{issue.description}</p>}

          {(issue.risk_summary || issue.potential_impact) && (
            <Section icon={ShieldAlert} title="Risk">
              {issue.risk_summary && <p className="text-sm text-muted-foreground mb-1"><span className="text-foreground/80">Summary: </span>{issue.risk_summary}</p>}
              {issue.potential_impact && <p className="text-sm text-muted-foreground"><span className="text-foreground/80">Potential impact: </span>{issue.potential_impact}</p>}
            </Section>
          )}

          <Section icon={MapPin} title="Location & scope">
            <div className="space-y-1.5">
              <Field icon={MapPin} label="Location" value={issue.location} />
              <Field icon={RouteIcon} label="Affected route" value={issue.affected_route} />
              <Field icon={Database} label="Affected entity" value={issue.affected_entity} />
              <Field icon={UsersIcon} label="Affected role" value={issue.affected_role} />
            </div>
          </Section>

          {issue.recommended_fix && (
            <Section icon={ClipboardCheck} title="Recommended fix">
              <p className="text-sm text-muted-foreground">{issue.recommended_fix}</p>
            </Section>
          )}

          {issue.fix_prompt && (
            <Section icon={ClipboardCheck} title="Fix prompt">
              <Textarea readOnly value={issue.fix_prompt} onFocus={(e) => e.target.select()} className="h-40 font-mono text-xs" />
              <CopyFixPromptButton fixPrompt={issue.fix_prompt} size="sm" className="mt-3" />
            </Section>
          )}

          {issue.retest_steps && (
            <Section icon={AlertTriangle} title="Retest steps">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-inter">{issue.retest_steps}</pre>
            </Section>
          )}

          {/* Manual retest checklist */}
          <Section icon={ListChecks} title="Manual retest checklist">
            <ul className="space-y-1.5">
              {getRetestChecklist(issue).map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
          </Section>

          {/* Status workflow */}
          <Section icon={ShieldAlert} title="Status">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {status === "False Positive" && (
              <Textarea
                placeholder="Reason this is a false positive (required)"
                value={fpReason}
                onChange={(e) => setFpReason(e.target.value)}
                className="mt-3 h-20"
              />
            )}
            <Button onClick={handleStatusChange} disabled={saving} className="mt-3 w-full">Update status</Button>
          </Section>

          {/* Admin notes */}
          <Section icon={StickyNote} title="Admin notes">
            <Textarea
              placeholder="Add notes about this issue..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-24"
            />
            <Button onClick={handleSaveNotes} disabled={saving} variant="outline" className="mt-3">Save notes</Button>
          </Section>

          {/* Timestamps */}
          <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div><p className="text-foreground/70 mb-0.5">Created</p>{formatDate(issue.created_date)}</div>
            <div><p className="text-foreground/70 mb-0.5">Updated</p>{formatDate(issue.updated_date)}</div>
            <div><p className="text-foreground/70 mb-0.5">Resolved</p>{formatDate(issue.resolved_at)}</div>
          </div>
        </div>
      </SheetContent>
      <RetestDialog issue={issue} open={retestOpen} onOpenChange={setRetestOpen} onChanged={onChanged} />
    </Sheet>
  );
}