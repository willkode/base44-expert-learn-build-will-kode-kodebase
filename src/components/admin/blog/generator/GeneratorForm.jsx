import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const POST_TYPES = [
  ["blog_post", "Blog post"], ["seo_article", "SEO article"], ["guide", "How-to guide"],
  ["tutorial", "Tutorial"], ["listicle", "Listicle"], ["comparison", "Comparison post"],
  ["product_update", "Product update"], ["announcement", "Feature announcement"],
  ["case_study", "Case study"], ["customer_story", "Customer story"],
  ["opinion", "Opinion / thought leadership"], ["pillar_page", "Pillar page"],
  ["cluster_support", "Topic cluster support"], ["changelog", "Changelog post"],
  ["local_seo", "Local SEO post"], ["faq_article", "FAQ article"], ["problem_solution", "Problem / solution"],
];
const INTENTS = ["informational", "commercial", "transactional", "navigational", "local"];
const TONES = ["Professional", "Conversational", "Authoritative", "Friendly", "Technical", "Playful"];
const LENGTHS = [["short", "Short"], ["medium", "Medium"], ["long", "Long"], ["comprehensive", "Comprehensive"]];

export default function GeneratorForm({ onGenerate, loading }) {
  const [form, setForm] = useState({
    post_type: "blog_post",
    topic: "",
    target_keyword: "",
    secondary_keywords: "",
    search_intent: "informational",
    target_audience: "Developers and founders building software",
    content_goal: "Educate readers and drive product interest",
    desired_tone: "Professional",
    article_length: "long",
    selected_category_id: "",
    topic_cluster_id: "",
    custom_instructions: "",
    title_options_count: 5,
    include_featured_image_prompt: true,
    include_faq_section: false,
    include_table_of_contents: false,
    include_meta_fields: true,
    generate_image: true,
  });
  const [categories, setCategories] = useState([]);
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    base44.entities.BlogCategory.list("displayOrder", 200).then(setCategories).catch(() => {});
    base44.entities.BlogTopicCluster.list("-created_date", 200).then(setClusters).catch(() => {});
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    onGenerate({
      ...form,
      secondary_keywords: form.secondary_keywords.split(",").map((s) => s.trim()).filter(Boolean),
      selected_category_id: form.selected_category_id || null,
      topic_cluster_id: form.topic_cluster_id || null,
      title_options_count: Number(form.title_options_count) || 5,
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Post type</Label>
          <Select value={form.post_type} onValueChange={(v) => set("post_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {POST_TYPES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Search intent</Label>
          <Select value={form.search_intent} onValueChange={(v) => set("search_intent", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {INTENTS.map((i) => <SelectItem key={i} value={i} className="capitalize">{i}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block">Topic *</Label>
        <Textarea value={form.topic} onChange={(e) => set("topic", e.target.value)} placeholder="What should this article be about?" className="h-20" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Target keyword</Label>
          <Input value={form.target_keyword} onChange={(e) => set("target_keyword", e.target.value)} placeholder="e.g. app blueprint generator" />
        </div>
        <div>
          <Label className="mb-1.5 block">Secondary keywords</Label>
          <Input value={form.secondary_keywords} onChange={(e) => set("secondary_keywords", e.target.value)} placeholder="comma, separated" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Target audience</Label>
          <Input value={form.target_audience} onChange={(e) => set("target_audience", e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block">Content goal</Label>
          <Input value={form.content_goal} onChange={(e) => set("content_goal", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label className="mb-1.5 block">Tone</Label>
          <Select value={form.desired_tone} onValueChange={(v) => set("desired_tone", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Length</Label>
          <Select value={form.article_length} onValueChange={(v) => set("article_length", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LENGTHS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Title options</Label>
          <Input type="number" min={1} max={10} value={form.title_options_count} onChange={(e) => set("title_options_count", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Category (optional)</Label>
          <Select value={form.selected_category_id || "none"} onValueChange={(v) => set("selected_category_id", v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Auto-suggest" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Auto-suggest</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Topic cluster (optional)</Label>
          <Select value={form.topic_cluster_id || "none"} onValueChange={(v) => set("topic_cluster_id", v === "none" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {clusters.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block">Custom instructions</Label>
        <Textarea value={form.custom_instructions} onChange={(e) => set("custom_instructions", e.target.value)} placeholder="Anything specific to include or avoid" className="h-16" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {[
          ["include_meta_fields", "Generate SEO meta fields"],
          ["include_featured_image_prompt", "Featured image prompt"],
          ["generate_image", "Generate featured image"],
          ["include_faq_section", "Include FAQ section"],
          ["include_table_of_contents", "Table of contents"],
        ].map(([k, l]) => (
          <div key={k} className="flex items-center justify-between rounded-lg border border-border p-2.5">
            <Label className="text-sm">{l}</Label>
            <Switch checked={form[k]} onCheckedChange={(v) => set(k, v)} />
          </div>
        ))}
      </div>

      <Button onClick={submit} disabled={loading || !form.topic.trim()} className="w-full gap-2 font-semibold" size="lg">
        <Sparkles className="w-4 h-4" /> {loading ? "Generating article..." : "Generate article"}
      </Button>
    </div>
  );
}