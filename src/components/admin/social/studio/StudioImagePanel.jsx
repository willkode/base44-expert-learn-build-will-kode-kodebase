import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Image as ImageIcon, Wand2, RefreshCw, Upload, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IMAGE_STYLES, ASPECT_RATIOS, ASPECT_CLASS, defaultAspectFor } from "./imageConfig";

export default function StudioImagePanel({ result, onChange, selectedPlatforms, includeTextOnImage }) {
  const fileRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [style, setStyle] = useState("clean_saas");
  const [aspect, setAspect] = useState(defaultAspectFor(selectedPlatforms));
  const [includeText, setIncludeText] = useState(!!includeTextOnImage);

  const set = (field, value) => onChange({ ...result, [field]: value });

  const generate = async () => {
    if (!result.image_prompt || !result.image_prompt.trim()) {
      toast.error("Add an image prompt first.");
      return;
    }
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateSocialPostImage", {
        image_prompt: result.image_prompt,
        platform: (selectedPlatforms && selectedPlatforms[0]) || "general",
        image_style: style,
        aspect_ratio: aspect,
        include_text_on_image: includeText,
      });
      if (res?.data?.error) throw new Error(res.data.error);
      onChange({
        ...result,
        image_url: res.data.image_url,
        image_alt_text: result.image_alt_text || res.data.image_alt_text,
        image_provider_meta: res.data.image_provider_meta,
      });
      toast.success(result.image_url ? "Image regenerated." : "Image generated.");
    } catch (e) {
      toast.error(e.message || "Image generation failed.");
    }
    setGenerating(false);
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange({
        ...result,
        image_url: file_url,
        image_provider_meta: { source: "upload", uploaded_at: new Date().toISOString() },
      });
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const remove = () => onChange({ ...result, image_url: "", image_provider_meta: undefined });

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-primary" />
        <h3 className="font-sora font-semibold">Post Image</h3>
      </div>

      {/* Preview */}
      {result.image_url ? (
        <img
          src={result.image_url}
          alt={result.image_alt_text || ""}
          className={`w-full rounded-xl border border-border object-cover ${ASPECT_CLASS[aspect] || ""}`}
        />
      ) : (
        <div className={`w-full rounded-xl border border-dashed border-border bg-background/40 flex items-center justify-center text-xs text-muted-foreground ${ASPECT_CLASS[aspect] || "aspect-video"}`}>
          No image yet
        </div>
      )}

      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">Image prompt</Label>
        <Textarea rows={3} value={result.image_prompt || ""} onChange={(e) => set("image_prompt", e.target.value)} placeholder="Describe the visual concept..." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Style</Label>
          <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm">
            {IMAGE_STYLES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Aspect ratio</Label>
          <select value={aspect} onChange={(e) => setAspect(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm">
            {ASPECT_RATIOS.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
        <input type="checkbox" checked={includeText} onChange={(e) => setIncludeText(e.target.checked)} className="accent-[color:hsl(var(--primary))]" />
        Allow minimal large text on image
      </label>

      <div>
        <Label className="mb-1.5 block text-xs text-muted-foreground">Alt text</Label>
        <Input value={result.image_alt_text || ""} onChange={(e) => set("image_alt_text", e.target.value)} placeholder="Accessible description of the image" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={generate} disabled={generating} size="sm">
          {generating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : (result.image_url ? <RefreshCw className="w-3.5 h-3.5 mr-1" /> : <Wand2 className="w-3.5 h-3.5 mr-1" />)}
          {result.image_url ? "Regenerate" : "Generate"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
          Upload
        </Button>
        {result.image_url && (
          <Button variant="ghost" size="sm" onClick={remove} className="text-red-400 hover:text-red-400">
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
          </Button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
      </div>

      <p className="text-xs text-muted-foreground">
        Keep text minimal and legible. Instagram requires an image before scheduling; Facebook media is optional by post type.
      </p>
    </div>
  );
}