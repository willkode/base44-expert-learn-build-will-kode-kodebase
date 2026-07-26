import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Film, Loader2 } from "lucide-react";
import { PLATFORMS, VOICES, DURATIONS } from "./videoOptions";

export default function SocialVideoForm({ onGenerate, generating }) {
  const [form, setForm] = useState({
    script: "",
    videoDetails: "",
    platform: "instagram",
    voice: "river",
    duration: 8,
    musicUrl: "",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const platform = PLATFORMS.find((p) => p.id === form.platform);

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div>
        <h3 className="font-sora font-semibold mb-1">AI video generator</h3>
        <p className="text-xs text-muted-foreground">
          Generates the clip, the voice over, on-screen text beats and hashtags. Every video carries the
          “Visit https://kodebase.us” overlay at the bottom center.
        </p>
      </div>

      <div>
        <Label className="mb-1.5 block">Voice-over script</Label>
        <Textarea
          rows={4}
          placeholder="Stop rebuilding the same Base44 app twice. The Prompt Engine plans it once, then hands you the exact build order..."
          value={form.script}
          onChange={(e) => set("script", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Keep it to about {form.duration * 3} words so the voice over fits the clip.
        </p>
      </div>

      <div>
        <Label className="mb-1.5 block">Video details (what should be on screen)</Label>
        <Textarea
          rows={3}
          placeholder="Slow push-in over a glowing blueprint of an app being assembled, orange gradient light trails connecting modules."
          value={form.videoDetails}
          onChange={(e) => set("videoDetails", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label className="mb-1.5 block">Platform</Label>
          <Select value={form.platform} onValueChange={(v) => set("platform", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Voice</Label>
          <Select value={form.voice} onValueChange={(v) => set("voice", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {VOICES.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Length</Label>
          <Select value={String(form.duration)} onValueChange={(v) => set("duration", Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DURATIONS.map((d) => (
                <SelectItem key={d} value={String(d)}>{d} seconds</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block">Background music URL (optional)</Label>
        <Input
          placeholder="https://.../track.mp3"
          value={form.musicUrl}
          onChange={(e) => set("musicUrl", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Paste any royalty-free track — it plays under the voice over in the preview and is saved with the video.
        </p>
      </div>

      <Button
        onClick={() => onGenerate({ ...form, aspectRatio: platform?.ratio || "9:16" })}
        disabled={generating || !form.script.trim()}
      >
        {generating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Film className="mr-1.5 h-4 w-4" />}
        {generating ? "Generating video, voice over & hashtags..." : "Generate video"}
      </Button>
    </div>
  );
}