import React, { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, XCircle, ClipboardList, MinusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { getRetestChecklist, isAutoRetestable } from "@/components/admin/security/retestEngine";
import { retestIssue } from "@/components/admin/security/issues/issueActions";

const RESULT_OPTIONS = [
  { value: "Passed", label: "Passed", icon: CheckCircle2, cls: "border-green-500/40 text-green-400" },
  { value: "Failed", label: "Failed", icon: XCircle, cls: "border-red-500/40 text-red-400" },
  { value: "Needs Manual Review", label: "Needs Manual Review", icon: ClipboardList, cls: "border-amber-500/40 text-amber-400" },
  { value: "Skipped", label: "Skipped", icon: MinusCircle, cls: "border-slate-500/40 text-slate-300" },
];

// Manual retest confirmation. Shows the category-based checklist and lets the
// admin confirm a result. Issues that can't be auto-evaluated require a result.
export default function RetestDialog({ issue, open, onOpenChange, onChanged }) {
  const { toast } = useToast();
  const [checked, setChecked] = useState([]);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setChecked([]); setResult(null); }
  }, [open, issue]);

  if (!issue) return null;

  const checklist = getRetestChecklist(issue);
  const autoOk = isAutoRetestable(issue);

  const toggle = (idx) => setChecked((c) => (c.includes(idx) ? c.filter((i) => i !== idx) : [...c, idx]));

  const run = async (chosen) => {
    setSaving(true);
    try {
      const res = await retestIssue(issue, { result: chosen, manual: Boolean(chosen) });
      onChanged?.();
      onOpenChange(false);
      const titles = {
        Passed: "Issue marked Fixed",
        Failed: "Issue still failing",
        "Needs Manual Review": "Set to Needs Retest",
        Skipped: "Retest skipped",
      };
      toast({
        title: titles[res.result] || "Retest recorded",
        description: res.result === "Passed" ? "Resolved time set and a retest note was added." : "A retest note and check record were added.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Retest Issue</DialogTitle>
          <DialogDescription>{issue.title || issue.category}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <p className="text-sm font-semibold mb-3">Manual retest checklist</p>
            <div className="space-y-2.5">
              {checklist.map((step, idx) => (
                <label key={idx} className="flex items-start gap-2.5 text-sm cursor-pointer">
                  <Checkbox checked={checked.includes(idx)} onCheckedChange={() => toggle(idx)} className="mt-0.5" />
                  <span className={checked.includes(idx) ? "text-muted-foreground line-through" : "text-foreground/90"}>{step}</span>
                </label>
              ))}
            </div>
          </div>

          {autoOk && (
            <Button variant="outline" disabled={saving} onClick={() => run(null)} className="w-full">
              Auto-evaluate against registry
            </Button>
          )}

          <div>
            <p className="text-sm font-semibold mb-2">Confirm manual result</p>
            <div className="grid grid-cols-2 gap-2">
              {RESULT_OPTIONS.map((o) => {
                const Icon = o.icon;
                const isActive = result === o.value;
                return (
                  <button
                    key={o.value}
                    onClick={() => setResult(o.value)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${isActive ? o.cls + " bg-secondary" : "border-border text-muted-foreground hover:bg-secondary"}`}
                  >
                    <Icon className="w-4 h-4" /> {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={() => run(result)} disabled={saving || !result}>Submit Retest</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}