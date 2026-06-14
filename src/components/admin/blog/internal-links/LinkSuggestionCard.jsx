import React, { useState } from "react";
import { Check, X, Pencil, ExternalLink, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT = {
  suggested: "secondary",
  applied: "default",
  rejected: "outline",
};

export default function LinkSuggestionCard({ link, targetTitle, targetSlug, onApply, onReject, onSaveAnchor }) {
  const [editing, setEditing] = useState(false);
  const [anchor, setAnchor] = useState(link.anchorText || "");
  const [busy, setBusy] = useState("");

  const isPending = link.status === "suggested";

  const run = async (kind, fn) => {
    setBusy(kind);
    try { await fn(); } finally { setBusy(""); }
  };

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm min-w-0">
          <ArrowRight className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium truncate">{targetTitle || "Target post"}</span>
        </div>
        <Badge variant={STATUS_VARIANT[link.status] || "secondary"} className="text-xs capitalize shrink-0">{link.status}</Badge>
      </div>

      {editing ? (
        <div className="flex items-center gap-2 mb-3">
          <Input value={anchor} onChange={(e) => setAnchor(e.target.value)} className="h-8 text-sm" placeholder="Anchor text" />
          <Button size="sm" className="h-8" disabled={busy === "anchor"} onClick={() => run("anchor", async () => { await onSaveAnchor(anchor); setEditing(false); })}>
            {busy === "anchor" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
          </Button>
        </div>
      ) : (
        <p className="text-sm mb-2">
          Anchor: <span className="font-medium text-primary">{link.anchorText || "—"}</span>
        </p>
      )}

      {link.contextSnippet && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 italic">“{link.contextSnippet}”</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {isPending && (
          <>
            <Button size="sm" className="h-7 gap-1" disabled={!!busy} onClick={() => run("apply", onApply)}>
              {busy === "apply" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Apply
            </Button>
            <Button size="sm" variant="outline" className="h-7 gap-1" disabled={!!busy} onClick={() => run("reject", () => onReject())}>
              <X className="w-3.5 h-3.5" /> Reject
            </Button>
            <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => setEditing((v) => !v)}>
              <Pencil className="w-3.5 h-3.5" /> Edit anchor
            </Button>
          </>
        )}
        {targetSlug && (
          <a href={`/learn/blog/${targetSlug}`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost" className="h-7 gap-1"><ExternalLink className="w-3.5 h-3.5" /> View target</Button>
          </a>
        )}
      </div>
    </div>
  );
}