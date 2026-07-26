import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, Send, Trash2, Loader2, CheckCircle2 } from "lucide-react";

export default function OcoyaDraftCard({
  draft,
  onChange,
  onPersist,
  onRegenImage,
  onSend,
  onDiscard,
  selectable = false,
  selected = false,
  onToggleSelect,
}) {
  if (draft.status === "sent") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="text-sm font-medium">"{draft.ideaTitle}" sent to Ocoya</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {selectable && (
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggleSelect?.()}
              aria-label="Select draft"
            />
          )}
          <Badge variant="secondary">{draft.ideaTitle}</Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={onDiscard}
          aria-label="Discard draft"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid md:grid-cols-[1fr_auto] gap-4">
        <Textarea
          value={draft.caption}
          onChange={(e) => onChange({ ...draft, caption: e.target.value })}
          onBlur={() => onPersist?.()}
          rows={6}
        />
        {draft.imageUrl && (
          <div className="space-y-2 md:w-44">
            <img src={draft.imageUrl} alt="" className="rounded-lg w-full md:w-44 border border-border object-cover" />
            <Button variant="outline" size="sm" className="w-full" onClick={onRegenImage} disabled={draft.busy}>
              {draft.busy === "image" ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
              New image
            </Button>
          </div>
        )}
      </div>
      {draft.error && <p className="text-sm text-destructive">{draft.error}</p>}
      <Button onClick={onSend} disabled={!!draft.busy} size="sm">
        {draft.busy === "send" ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
        Approve & send to Ocoya
      </Button>
    </div>
  );
}