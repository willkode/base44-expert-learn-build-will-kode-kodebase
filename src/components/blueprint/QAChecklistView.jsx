import React from "react";
import { ClipboardCheck, CheckCircle2, XCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const NEXT = { pending: "passed", passed: "failed", failed: "pending" };
const ICONS = {
  pending: { icon: Circle, color: "text-muted-foreground/50" },
  passed: { icon: CheckCircle2, color: "text-green-400" },
  failed: { icon: XCircle, color: "text-destructive" },
};

export default function QAChecklistView({ items, onUpdate }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground py-4">
        <ClipboardCheck className="w-5 h-5" /> No QA checklist items yet.
      </div>
    );
  }

  const toggle = async (item) => {
    const next = NEXT[item.status] || "passed";
    await base44.entities.QAItem.update(item.id, { status: next });
    onUpdate();
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const meta = ICONS[item.status] || ICONS.pending;
        const Icon = meta.icon;
        return (
          <div key={item.id} className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-4">
            <button onClick={() => toggle(item)} className="mt-0.5 shrink-0">
              <Icon className={`w-5 h-5 ${meta.color}`} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{item.testName}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{item.category}</span>
              </div>
              {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
              {item.expectedResult && <p className="text-xs text-muted-foreground mt-1">Expected: {item.expectedResult}</p>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => toggle(item)} className="shrink-0 capitalize">
              {item.status}
            </Button>
          </div>
        );
      })}
    </div>
  );
}