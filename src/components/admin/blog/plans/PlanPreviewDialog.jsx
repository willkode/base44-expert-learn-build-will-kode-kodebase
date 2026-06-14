import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Sparkles, Loader2, CalendarRange, ListChecks } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PlannedPostList from "./PlannedPostList";
import CalendarPreview from "./CalendarPreview";
import { trackEvent } from "@/lib/analytics";

// Shows a generated plan: editable idea list + calendar preview, and runs the
// auto-fill (generateAndScheduleBlogPostsFromPlan) for selected ideas.
export default function PlanPreviewDialog({ open, onOpenChange, plan, onSaved }) {
  const [ideas, setIdeas] = useState([]);
  const [selected, setSelected] = useState([]);
  const [autoApprove, setAutoApprove] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    if (plan) {
      const list = Array.isArray(plan.plannedPosts) ? plan.plannedPosts : [];
      setIdeas(list);
      setSelected(list.map((idea, i) => ({ idea, i })).filter(({ idea }) => idea.status !== "created").map(({ i }) => i));
    }
  }, [plan]);

  if (!plan) return null;

  const toggle = (i) => setSelected((s) => s.includes(i) ? s.filter((x) => x !== i) : [...s, i]);

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= ideas.length) return;
    const next = [...ideas];
    [next[i], next[j]] = [next[j], next[i]];
    setIdeas(next);
  };

  const remove = (i) => {
    setIdeas((list) => list.filter((_, idx) => idx !== i));
    setSelected((s) => s.filter((x) => x !== i).map((x) => (x > i ? x - 1 : x)));
  };

  const changeDate = (i, date) => {
    setIdeas((list) => list.map((idea, idx) => (idx === i ? { ...idea, scheduledDate: date } : idea)));
  };

  const persistIdeas = async () => {
    setSavingOrder(true);
    try {
      const saved = await base44.entities.BlogContentPlan.update(plan.id, { plannedPosts: ideas });
      toast.success("Plan updated");
      onSaved?.(saved);
    } finally {
      setSavingOrder(false);
    }
  };

  const autoFill = async () => {
    if (selected.length === 0) { toast.error("Select at least one post idea"); return; }
    setGenerating(true);
    try {
      // Persist any edits (order, dates, removals) first so indexes line up.
      await base44.entities.BlogContentPlan.update(plan.id, { plannedPosts: ideas });
      const res = await base44.functions.invoke("generateAndScheduleBlogPostsFromPlan", {
        content_plan_id: plan.id,
        planned_indexes: selected,
        approval_mode: autoApprove ? "auto_approve" : "require_review",
        generate_images: plan.generateImages !== false,
      });
      if (res.data?.success) {
        trackEvent("blog_plan_autofill", { generated: res.data.generated, mode: autoApprove ? "auto_approve" : "require_review" });
        toast.success(`Generated ${res.data.generated} post(s)`);
        const refreshed = await base44.entities.BlogContentPlan.filter({ id: plan.id });
        if (refreshed[0]) { setIdeas(refreshed[0].plannedPosts || []); onSaved?.(refreshed[0]); }
        setSelected([]);
      } else {
        toast.error(res.data?.error || "Auto-fill failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Auto-fill failed");
    } finally {
      setGenerating(false);
    }
  };

  const pendingCount = ideas.filter((i) => i.status !== "created").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-sora">{plan.name}</DialogTitle>
        </DialogHeader>

        {plan.strategySummary && (
          <p className="text-sm text-muted-foreground bg-secondary/40 rounded-lg p-3">{plan.strategySummary}</p>
        )}

        <Tabs defaultValue="ideas" className="mt-2">
          <TabsList>
            <TabsTrigger value="ideas" className="gap-1.5"><ListChecks className="w-4 h-4" /> Ideas ({ideas.length})</TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1.5"><CalendarRange className="w-4 h-4" /> Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="ideas" className="mt-3">
            {ideas.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ideas in this plan.</p>
            ) : (
              <PlannedPostList
                ideas={ideas}
                selected={selected}
                onToggle={toggle}
                onMove={move}
                onRemove={remove}
                onDateChange={changeDate}
              />
            )}
            <div className="mt-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={persistIdeas} disabled={savingOrder}>
                {savingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-3">
            <CalendarPreview ideas={ideas} />
          </TabsContent>
        </Tabs>

        <div className="border-t border-border pt-4 mt-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Auto-approve generated posts</Label>
              <p className="text-xs text-muted-foreground">Only applies if approval isn't required in blog settings. Posts are never auto-published.</p>
            </div>
            <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{selected.length} of {pendingCount} pending selected</p>
            <Button onClick={autoFill} disabled={generating || selected.length === 0} className="gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generating…" : `Generate ${selected.length} selected`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}