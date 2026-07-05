import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Wand2, RefreshCw, Send, Loader2, CheckCircle2 } from "lucide-react";
import OcoyaProfilePicker from "@/components/admin/ocoya/OcoyaProfilePicker";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { trackEvent } from "@/lib/analytics";

export const IMAGE_STYLES = [
  { id: "brand", label: "Brand style (flat vector)" },
  { id: "photoreal", label: "Photorealistic" },
  { id: "threeD", label: "3D render" },
  { id: "illustration", label: "Illustration" },
  { id: "minimal", label: "Minimal abstract" },
  { id: "isometric", label: "Isometric scene" },
];

const MODES = [
  { id: "now", label: "Publish now" },
  { id: "schedule", label: "Schedule" },
  { id: "draft", label: "Save as draft" },
];

export default function OcoyaCreatePost({ workspaceId }) {
  const [instructions, setInstructions] = useState("");
  const [includeImage, setIncludeImage] = useState(true);
  const [imageStyle, setImageStyle] = useState("brand");
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState(null); // { caption, imagePrompt, imageUrl }
  const [regenImage, setRegenImage] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [mode, setMode] = useState("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleGenerate = async () => {
    if (!instructions.trim()) return;
    setGenerating(true);
    setError(null);
    setSent(false);
    const res = await base44.functions.invoke("generateOcoyaPostContent", {
      instructions,
      includeImage,
      imageStyle,
    });
    setGenerating(false);
    if (res.data?.error) {
      setError(res.data.error);
      return;
    }
    setContent(res.data);
    trackEvent("ocoya_content_generated", { with_image: includeImage });
  };

  const handleRegenImage = async () => {
    if (!content?.imagePrompt) return;
    setRegenImage(true);
    const res = await base44.functions.invoke("generateOcoyaPostContent", {
      imagePrompt: content.imagePrompt,
      imageStyle,
    });
    setRegenImage(false);
    if (res.data?.imageUrl) setContent({ ...content, imageUrl: res.data.imageUrl });
  };

  const handleSend = async () => {
    setError(null);
    if (!content?.caption?.trim()) {
      setError("Generate or write a caption first.");
      return;
    }
    if (mode !== "draft" && selectedProfiles.length === 0) {
      setError("Select at least one social profile, or save as a draft.");
      return;
    }
    if (mode === "schedule" && !scheduledAt) {
      setError("Pick a date and time to schedule this post.");
      return;
    }
    setSending(true);
    const payload = {
      action: "createPost",
      workspaceId,
      caption: content.caption,
    };
    if (includeImage && content.imageUrl) payload.mediaUrls = [content.imageUrl];
    if (selectedProfiles.length) payload.socialProfileIds = selectedProfiles;
    if (mode === "now") payload.scheduledAt = new Date().toISOString();
    if (mode === "schedule") payload.scheduledAt = new Date(scheduledAt).toISOString();

    const res = await base44.functions.invoke("ocoyaRequest", payload);
    setSending(false);
    if (res.data?.error) {
      setError(res.data.error);
      return;
    }
    trackEvent("ocoya_post_created", { mode });
    setSent(true);
  };

  const reset = () => {
    setInstructions("");
    setContent(null);
    setSelectedProfiles([]);
    setScheduledAt("");
    setMode("now");
    setSent(false);
    setError(null);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center max-w-xl mx-auto">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
        <h3 className="font-sora font-bold text-xl mb-2">Sent to Ocoya</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "now"
            ? "Your post was queued for immediate publishing."
            : mode === "schedule"
            ? "Your post is scheduled."
            : "Your post was saved as a draft in Ocoya."}
        </p>
        <Button onClick={reset}>Create another post</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Step 1 — Instructions */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <h3 className="font-sora font-semibold mb-1">1. Tell the AI what to post</h3>
          <p className="text-xs text-muted-foreground">
            Describe the topic, angle, offer, or announcement. The AI writes the copy and designs the image.
          </p>
        </div>
        <Textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder='e.g. "Announce our Summer Sale — 50% off every prompt pack until July 31. Energetic, urgency-driven, aimed at AI app builders."'
          rows={4}
        />
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={includeImage} onCheckedChange={setIncludeImage} />
              Generate an AI image
            </label>
            {includeImage && (
              <Select value={imageStyle} onValueChange={setImageStyle}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Image style" />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_STYLES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Button onClick={handleGenerate} disabled={generating || !instructions.trim()}>
            {generating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1.5" />}
            {generating ? "Generating..." : content ? "Regenerate" : "Generate post"}
          </Button>
        </div>
      </div>

      {content && (
        <>
          {/* Step 2 — Review */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-sora font-semibold">2. Review & edit</h3>
            <div className="space-y-2">
              <Label>Caption</Label>
              <Textarea
                value={content.caption}
                onChange={(e) => setContent({ ...content, caption: e.target.value })}
                rows={7}
              />
            </div>
            {includeImage && content.imageUrl && (
              <div className="space-y-2">
                <Label>Image</Label>
                <img src={content.imageUrl} alt="Generated post visual" className="rounded-xl w-full max-w-md border border-border" />
                <div className="space-y-2 max-w-md">
                  <Label className="text-xs text-muted-foreground">Describe the image you want</Label>
                  <Textarea
                    value={content.imagePrompt}
                    onChange={(e) => setContent({ ...content, imagePrompt: e.target.value })}
                    rows={3}
                    placeholder='e.g. "A glowing rocket launching from a laptop screen, blueprint grid background"'
                  />
                  <Button variant="outline" size="sm" onClick={handleRegenImage} disabled={regenImage || !content.imagePrompt?.trim()}>
                    {regenImage ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
                    Regenerate image
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Step 3 — Publish */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-sora font-semibold">3. Choose channels & publish</h3>
            <OcoyaProfilePicker workspaceId={workspaceId} selected={selectedProfiles} onChange={setSelectedProfiles} />
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    mode === m.id ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary/40"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {mode === "schedule" && (
              <div className="space-y-2 max-w-xs">
                <Label>Schedule for</Label>
                <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={handleSend}
              disabled={sending}
              size="lg"
              className="font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
            >
              {sending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
              {mode === "now" ? "Publish via Ocoya" : mode === "schedule" ? "Schedule via Ocoya" : "Save draft in Ocoya"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}