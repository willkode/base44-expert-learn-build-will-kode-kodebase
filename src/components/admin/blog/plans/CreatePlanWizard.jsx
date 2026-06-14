import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Sparkles, Loader2, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CONTENT_TYPE_OPTIONS, GOAL_OPTIONS, FREQUENCY_OPTIONS, LENGTH_OPTIONS,
} from "./planConstants";
import { trackEvent } from "@/lib/analytics";

// Multi-field plan settings dialog. On submit, calls generateBlogContentPlan and
// returns the saved plan (with AI-generated ideas) to the parent for preview/editing.
export default function CreatePlanWizard({ open, onOpenChange, onPlanGenerated }) {
  const [clusters, setClusters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [kwInput, setKwInput] = useState("");

  const [form, setForm] = useState({
    name: "",
    goal: "traffic",
    targetAudience: "",
    topicClusterId: "none",
    keywords: [],
    contentTypes: ["guide", "listicle", "comparison"],
    startDate: "",
    endDate: "",
    frequency: "weekly",
    defaultCategoryId: "none",
    defaultTagIds: [],
    desiredTone: "",
    articleLength: "long",
    requireApproval: true,
    generateImages: true,
    customInstructions: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!open) return;
    Promise.all([
      base44.entities.BlogTopicCluster.list("-created_date", 200).catch(() => []),
      base44.entities.BlogCategory.list("displayOrder", 200).catch(() => []),
      base44.entities.BlogTag.list("name", 200).catch(() => []),
    ]).then(([cl, cat, tg]) => { setClusters(cl); setCategories(cat); setTags(tg); });
  }, [open]);

  const toggleType = (value) => {
    set("contentTypes", form.contentTypes.includes(value)
      ? form.contentTypes.filter((t) => t !== value)
      : [...form.contentTypes, value]);
  };

  const toggleTag = (id) => {
    set("defaultTagIds", form.defaultTagIds.includes(id)
      ? form.defaultTagIds.filter((t) => t !== id)
      : [...form.defaultTagIds, id]);
  };

  const addKeyword = () => {
    const v = kwInput.trim();
    if (v && !form.keywords.includes(v)) set("keywords", [...form.keywords, v]);
    setKwInput("");
  };

  const generate = async () => {
    if (!form.name.trim()) { toast.error("Plan name is required"); return; }
    if (form.contentTypes.length === 0) { toast.error("Pick at least one content type"); return; }
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateBlogContentPlan", {
        name: form.name,
        goal: form.goal,
        target_audience: form.targetAudience,
        topic_cluster_id: form.topicClusterId === "none" ? null : form.topicClusterId,
        keywords: form.keywords,
        content_types: form.contentTypes,
        start_date: form.startDate,
        end_date: form.endDate,
        frequency: form.frequency,
        default_category_id: form.defaultCategoryId === "none" ? null : form.defaultCategoryId,
        default_tag_ids: form.defaultTagIds,
        desired_tone: form.desiredTone,
        article_length: form.articleLength,
        require_approval: form.requireApproval,
        generate_images: form.generateImages,
        custom_instructions: form.customInstructions,
      });
      if (res.data?.success) {
        trackEvent("blog_content_plan_generated", { goal: form.goal, ideas: res.data.ideas?.length || 0 });
        toast.success(`Plan created with ${res.data.ideas?.length || 0} post ideas`);
        onPlanGenerated(res.data.plan);
        onOpenChange(false);
      } else {
        toast.error(res.data?.error || "Plan generation failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Plan generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-sora">Create content plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Plan name</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Q3 SEO Authority Push" className="mt-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Goal</Label>
              <Select value={form.goal} onValueChange={(v) => set("goal", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{GOAL_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Topic cluster</Label>
              <Select value={form.topicClusterId} onValueChange={(v) => set("topicClusterId", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {clusters.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Target audience</Label>
            <Input value={form.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} placeholder="Founders and developers building SaaS" className="mt-1" />
          </div>

          <div>
            <Label>Main keywords</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                placeholder="Type a keyword and press Enter"
              />
              <Button type="button" variant="outline" onClick={addKeyword}>Add</Button>
            </div>
            {form.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.keywords.map((k) => (
                  <Badge key={k} variant="secondary" className="gap-1">
                    {k}<button onClick={() => set("keywords", form.keywords.filter((x) => x !== k))}><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Content types</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {CONTENT_TYPE_OPTIONS.map((o) => {
                const active = form.contentTypes.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleType(o.value)}
                    className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Start date</Label>
              <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>End date</Label>
              <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={(v) => set("frequency", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{FREQUENCY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Default category</Label>
              <Select value={form.defaultCategoryId} onValueChange={(v) => set("defaultCategoryId", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Article length</Label>
              <Select value={form.articleLength} onValueChange={(v) => set("articleLength", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{LENGTH_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {tags.length > 0 && (
            <div>
              <Label>Default tags</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {tags.map((t) => {
                  const active = form.defaultTagIds.includes(t.id);
                  return (
                    <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
                      className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <Label>Desired tone</Label>
            <Input value={form.desiredTone} onChange={(e) => set("desiredTone", e.target.value)} placeholder="Practical, confident, developer-friendly" className="mt-1" />
          </div>

          <div>
            <Label>Custom instructions</Label>
            <Textarea value={form.customInstructions} onChange={(e) => set("customInstructions", e.target.value)} placeholder="Anything the AI should keep in mind across the plan…" className="mt-1" rows={2} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Require approval before publish</p>
              <p className="text-xs text-muted-foreground">Generated posts will go to review first.</p>
            </div>
            <Switch checked={form.requireApproval} onCheckedChange={(v) => set("requireApproval", v)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Generate featured images</p>
              <p className="text-xs text-muted-foreground">Create a dark-tech cover image per post.</p>
            </div>
            <Switch checked={form.generateImages} onCheckedChange={(v) => set("generateImages", v)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>Cancel</Button>
          <Button onClick={generate} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Generating ideas…" : "Generate plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}