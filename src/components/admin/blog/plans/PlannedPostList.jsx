import React from "react";
import { GripVertical, ArrowUp, ArrowDown, Trash2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { contentTypeLabel } from "./planConstants";

const STATUS_BADGE = {
  idea: { variant: "secondary", icon: Clock, label: "Idea" },
  created: { variant: "default", icon: CheckCircle2, label: "Created" },
  skipped_duplicate: { variant: "outline", icon: AlertTriangle, label: "Duplicate" },
  failed: { variant: "destructive", icon: AlertTriangle, label: "Failed" },
};

// Editable list of planned post ideas: select, reorder, edit date, remove.
export default function PlannedPostList({ ideas, selected, onToggle, onMove, onRemove, onDateChange }) {
  return (
    <div className="space-y-2">
      {ideas.map((idea, i) => {
        const created = idea.status === "created";
        const sb = STATUS_BADGE[idea.status] || STATUS_BADGE.idea;
        const Icon = sb.icon;
        return (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-3">
            <div className="pt-1">
              <Checkbox checked={selected.includes(i)} disabled={created} onCheckedChange={() => onToggle(i)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm truncate">{idea.title}</p>
                <Badge variant={sb.variant} className="text-[10px] gap-1"><Icon className="w-3 h-3" />{sb.label}</Badge>
              </div>
              {idea.angle && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{idea.angle}</p>}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] capitalize">{contentTypeLabel(idea.contentType)}</Badge>
                <span className="text-[11px] text-primary">{idea.targetKeyword}</span>
                <span className="text-[11px] text-muted-foreground capitalize">· {idea.searchIntent}</span>
                <Input
                  type="date"
                  value={idea.scheduledDate || ""}
                  disabled={created}
                  onChange={(e) => onDateChange(i, e.target.value)}
                  className="h-7 w-36 text-xs ml-auto"
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => onMove(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
              <button onClick={() => onMove(i, 1)} disabled={i === ideas.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
            </div>
            {!created && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onRemove(i)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}