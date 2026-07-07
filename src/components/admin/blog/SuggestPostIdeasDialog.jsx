import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";

export default function SuggestPostIdeasDialog({ open, onOpenChange, onDraftsCreated }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, current: "" });
  const [createdPosts, setCreatedPosts] = useState(null);
  const [error, setError] = useState(null);

  const fetchIdeas = async () => {
    setLoading(true);
    setError(null);
    setIdeas([]);
    setSelected([]);
    try {
      const res = await base44.functions.invoke("suggestBlogPostIdeas", {});
      if (res.data?.error) setError(res.data.error);
      else setIdeas(res.data.ideas || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      setCreatedPosts(null);
      fetchIdeas();
    }
  }, [open]);

  const toggle = (i) =>
    setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const handleCreate = async () => {
    const picked = selected.map((i) => ideas[i]);
    setCreating(true);
    setError(null);
    setProgress({ done: 0, total: picked.length, current: picked[0]?.title || "" });
    const created = [];
    for (let i = 0; i < picked.length; i++) {
      const idea = picked[i];
      setProgress({ done: i, total: picked.length, current: idea.title });
      try {
        const res = await base44.functions.invoke("generateBlogPost", {
          topic: idea.title,
          target_keyword: idea.target_keyword,
          search_intent: idea.search_intent || "informational",
          content_goal: idea.angle,
        });
        if (res.data?.post) created.push(res.data.post);
      } catch (e) {
        setError(`"${idea.title}" failed: ${e?.response?.data?.error || e.message}`);
      }
    }
    setProgress({ done: picked.length, total: picked.length, current: "" });
    setCreating(false);
    setCreatedPosts(created);
    if (created.length) onDraftsCreated?.(created);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !creating && onOpenChange(o)}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> AI post ideas
          </DialogTitle>
          <DialogDescription>
            Pick the ideas you like — each one is generated as a full draft article.
          </DialogDescription>
        </DialogHeader>

        {createdPosts ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="font-medium mb-1">
              {createdPosts.length} draft{createdPosts.length === 1 ? "" : "s"} created
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              They're now in your posts list, ready to review and edit.
            </p>
            {error && <p className="text-sm text-destructive mb-4">{error}</p>}
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        ) : creating ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="font-medium mb-1">
              Writing draft {Math.min(progress.done + 1, progress.total)} of {progress.total}
            </p>
            <p className="text-sm text-muted-foreground">{progress.current}</p>
            <p className="text-xs text-muted-foreground mt-3">Each article can take up to a minute.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Brainstorming 7 ideas...
          </div>
        ) : (
          <>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              {ideas.map((idea, i) => (
                <label
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selected.includes(i) ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"
                  }`}
                >
                  <Checkbox checked={selected.includes(i)} onCheckedChange={() => toggle(i)} className="mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{idea.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{idea.angle}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <Badge variant="secondary" className="text-[10px]">{idea.target_keyword}</Badge>
                      {idea.search_intent && (
                        <Badge variant="outline" className="text-[10px] capitalize">{idea.search_intent}</Badge>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={fetchIdeas} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-1.5" /> New ideas
              </Button>
              <Button onClick={handleCreate} disabled={selected.length === 0}>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Create {selected.length || ""} draft{selected.length === 1 ? "" : "s"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}