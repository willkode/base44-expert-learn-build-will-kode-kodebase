import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wand2 } from "lucide-react";
import {
  ASPECT_RATIOS,
  PLATFORM_OPTIONS,
  PROJECT_TYPES,
  TARGET_DURATIONS,
  VISUAL_STYLES,
  VOICES,
  defaultContinuityBible,
  estimateSeconds,
} from "./longFormOptions";

export default function ProjectWizard({ onCreate, creating, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    brief: "",
    project_type: "social",
    platform: "tiktok",
    target_duration: 30,
    aspect_ratio: "9:16",
    resolution: "1080p",
    visual_style: "dark_tech",
    style_notes: "",
    negative_prompt: "text, letters, logos, watermarks, clutter",
    voice: "river",
    language: "en",
  });

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const estScenes = Math.max(1, Math.ceil(Number(form.target_duration) / 6.5));

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <h3 className="font-sora font-semibold text-lg">New long-form video project</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Project title</Label>
          <Input value={form.title} onChange={(e) => set("title")(e.target.value)} placeholder="Base44 migration explainer" />
        </div>
        <div className="space-y-1.5">
          <Label>Project type</Label>
          <Select value={form.project_type} onValueChange={set("project_type")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Idea, script, article, product description or brief</Label>
        <Textarea
          rows={5}
          value={form.brief}
          onChange={(e) => set("brief")(e.target.value)}
          placeholder="Paste an article, product description or just describe the video you want. The script is generated from this."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Platform</Label>
          <Select
            value={form.platform}
            onValueChange={(v) => {
              const p = PLATFORM_OPTIONS.find((o) => o.id === v);
              setForm((f) => ({ ...f, platform: v, aspect_ratio: p?.ratio || f.aspect_ratio }));
            }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PLATFORM_OPTIONS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Target duration</Label>
          <Select value={String(form.target_duration)} onValueChange={(v) => set("target_duration")(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TARGET_DURATIONS.map((d) => <SelectItem key={d} value={String(d)}>{d} seconds</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Format</Label>
          <Select value={form.aspect_ratio} onValueChange={set("aspect_ratio")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ASPECT_RATIOS.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Visual style</Label>
          <Select value={form.visual_style} onValueChange={set("visual_style")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {VISUAL_STYLES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Voice</Label>
          <Select value={form.voice} onValueChange={set("voice")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {VOICES.map((v) => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Resolution</Label>
          <Select value={form.resolution} onValueChange={set("resolution")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="720p">720p</SelectItem>
              <SelectItem value="1080p">1080p</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Style notes (optional)</Label>
          <Input value={form.style_notes} onChange={(e) => set("style_notes")(e.target.value)} placeholder="Palette, lighting, mood, camera language" />
        </div>
        <div className="space-y-1.5">
          <Label>Negative prompt</Label>
          <Input value={form.negative_prompt} onChange={(e) => set("negative_prompt")(e.target.value)} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Estimate</p>
        <p>
          ~{estScenes} scenes · {form.target_duration}s total · ~{estScenes} voice generations · ~{estScenes} video
          generations · {form.aspect_ratio} · max 8s per scene
        </p>
        {form.brief && <p className="mt-1">Brief reads as roughly {estimateSeconds(form.brief)}s of speech.</p>}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => onCreate({ ...form, continuity_bible: defaultContinuityBible(), status: "DRAFT" })}
          disabled={creating || !form.title.trim() || !form.brief.trim()}
        >
          {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Wand2 className="w-4 h-4" /> Create project</>}
        </Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}