import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Loader2 } from "lucide-react";

export default function OcoyaBulkApproveBar({
  total,
  selectedCount,
  allSelected,
  onToggleAll,
  onSend,
  sending,
  hint,
}) {
  if (total === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3 flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <Checkbox checked={allSelected} onCheckedChange={(c) => onToggleAll(!!c)} />
        Select all ({total})
      </label>
      <Button size="sm" onClick={onSend} disabled={selectedCount === 0 || sending}>
        {sending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
        {sending ? "Sending..." : `Approve & send ${selectedCount || ""} selected`}
      </Button>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}