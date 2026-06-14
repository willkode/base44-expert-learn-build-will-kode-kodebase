import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Link2, Sparkles, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Inline internal-link suggestions for the post being edited.
// onApplied: called after a link is inserted so the editor can refresh the post content.
export default function InternalLinksPanel({ postId, onApplied }) {
  const [links, setLinks] = useState([]);
  const [titles, setTitles] = useState({});
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const rows = await base44.entities.BlogInternalLink.filter({ sourcePostId: postId }, "-created_date", 100);
    setLinks(rows);
    const targetIds = [...new Set(rows.map((r) => r.targetPostId))];
    const map = {};
    await Promise.all(targetIds.map(async (tid) => {
      const t = await base44.entities.BlogPost.filter({ id: tid });
      if (t[0]) map[tid] = t[0].title;
    }));
    setTitles(map);
    setLoading(false);
  }, [postId]);

  useEffect(() => { load(); }, [load]);

  const scan = async () => {
    if (!postId) { toast.error("Save the post first"); return; }
    setScanning(true);
    try {
      const res = await base44.functions.invoke("generateInternalLinkSuggestions", { blog_post_id: postId });
      if (res.data?.success) { toast.success(`${res.data.created} suggestion(s)`); await load(); }
      else toast.error(res.data?.error || "Scan failed");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const apply = async (id) => {
    setBusy(id);
    try {
      const res = await base44.functions.invoke("applyInternalLinkSuggestion", { internal_link_id: id });
      if (res.data?.success) { toast.success("Link applied"); onApplied?.(res.data.post); await load(); }
      else toast.error(res.data?.error || "Apply failed");
    } finally { setBusy(null); }
  };

  const reject = async (id) => {
    setBusy(id);
    try {
      const res = await base44.functions.invoke("rejectInternalLinkSuggestion", { internal_link_id: id });
      if (res.data?.success) { await load(); } else toast.error(res.data?.error || "Reject failed");
    } finally { setBusy(null); }
  };

  const pending = links.filter((l) => l.status === "suggested");

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium flex items-center gap-1.5"><Link2 className="w-4 h-4 text-primary" /> Internal links</p>
        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={scan} disabled={scanning || !postId}>
          {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Suggest
        </Button>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : pending.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {postId ? "No pending suggestions. Run a scan to find relevant links." : "Save the post to suggest internal links."}
        </p>
      ) : (
        <ul className="space-y-2">
          {pending.map((l) => (
            <li key={l.id} className="rounded-lg border border-border p-2.5">
              <p className="text-xs mb-1">→ <span className="font-medium">{titles[l.targetPostId] || "post"}</span></p>
              <p className="text-xs text-muted-foreground mb-2">Anchor: <span className="text-primary">{l.anchorText}</span></p>
              <div className="flex gap-1.5">
                <Button size="sm" className="h-6 text-xs gap-1" disabled={busy === l.id} onClick={() => apply(l.id)}>
                  {busy === l.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Apply
                </Button>
                <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" disabled={busy === l.id} onClick={() => reject(l.id)}>
                  <X className="w-3 h-3" /> Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}