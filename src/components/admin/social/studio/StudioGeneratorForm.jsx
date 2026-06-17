import React from "react";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PLATFORMS } from "@/components/admin/social/socialConfig";
import { CONTENT_TYPES, TONE_OPTIONS } from "./studioConfig";

export default function StudioGeneratorForm({ form, setForm, campaigns, onGenerate, generating }) {
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const togglePlatform = (key) =>
    set("selected_platforms", form.selected_platforms.includes(key)
      ? form.selected_platforms.filter((p) => p !== key)
      : [...form.selected_platforms, key]);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Campaign (optional)</Label>
          <select
            value={form.campaign_id}
            onChange={(e) => set("campaign_id", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">No campaign</option>
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <Label className="mb-1.5 block">Content type</Label>
          <select
            value={form.content_type}
            onChange={(e) => set("content_type", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            {CONTENT_TYPES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block">Topic <span className="text-primary">*</span></Label>
        <Textarea
          rows={3}
          value={form.topic}
          onChange={(e) => set("topic", e.target.value)}
          placeholder="What is this post about? e.g. Launch of our AI blueprint generator..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Desired tone</Label>
          <select
            value={form.tone}
            onChange={(e) => set("tone", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">Use brand / campaign tone</option>
            {TONE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <Label className="mb-1.5 block">Variations per platform</Label>
          <select
            value={form.number_of_variations}
            onChange={(e) => set("number_of_variations", Number(e.target.value))}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Platforms</Label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => togglePlatform(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                form.selected_platforms.includes(key)
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block">Optional notes / source text</Label>
        <Textarea
          rows={2}
          value={form.custom_instructions}
          onChange={(e) => set("custom_instructions", e.target.value)}
          placeholder="Extra angle, must-include points, or paste source text to summarize..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { key: "include_hashtags", label: "Hashtags" },
          { key: "include_call_to_action", label: "Call to action" },
          { key: "include_image_prompt", label: "Image prompt" },
        ].map((opt) => (
          <div key={opt.key} className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2">
            <span className="text-sm">{opt.label}</span>
            <Switch checked={form[opt.key]} onCheckedChange={(v) => set(opt.key, v)} />
          </div>
        ))}
      </div>

      <Button onClick={onGenerate} disabled={generating || !form.topic.trim() || form.selected_platforms.length === 0} className="w-full">
        {generating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1.5" />}
        Generate Content
      </Button>
    </div>
  );
}