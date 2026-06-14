import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  Image as ImageIcon, Sparkles, RefreshCw, Upload, Trash2, Loader2, Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { trackEvent } from "@/lib/analytics";

export const IMAGE_STYLES = [
  "Clean SaaS blog graphic",
  "Editorial illustration",
  "Abstract technology visual",
  "Product education graphic",
  "Minimal branded graphic",
  "Founder/thought leadership graphic",
  "Tutorial cover image",
  "Comparison article cover",
  "Local business image",
  "Newsletter-style cover",
];

export const ASPECT_RATIOS = ["16:9", "4:3", "1:1", "3:2"];

const RATIO_CLASS = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "3:2": "aspect-[3/2]",
};

// post: current post state, set: (key,value)=>void, savedId: post id (required for AI generation)
export default function FeaturedImagePanel({ post, set, savedId }) {
  const [imagePrompt, setImagePrompt] = useState(post.featuredImagePrompt || "");
  const [style, setStyle] = useState("Clean SaaS blog graphic");
  const [ratio, setRatio] = useState("16:9");
  const [brandColors, setBrandColors] = useState(true);
  const [includeLogo, setIncludeLogo] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const hasImage = !!post.coverImageUrl;

  const generate = async () => {
    if (!savedId) { toast.error("Save the post first to generate an image"); return; }
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateBlogFeaturedImage", {
        blog_post_id: savedId,
        image_prompt: imagePrompt,
        image_style: style,
        aspect_ratio: ratio,
        include_brand_colors: brandColors,
        include_logo: includeLogo,
      });
      if (res.data?.success) {
        set("coverImageUrl", res.data.imageUrl);
        set("featuredImageAlt", res.data.altText);
        set("featuredImagePrompt", res.data.featuredImagePrompt);
        if (res.data.post?.ogImageUrl) set("ogImageUrl", res.data.post.ogImageUrl);
        if (res.data.post?.twitterImageUrl) set("twitterImageUrl", res.data.post.twitterImageUrl);
        toast.success(hasImage ? "Image regenerated" : "Image generated");
        trackEvent("blog_featured_image_generated", { style, ratio, regenerate: hasImage });
      } else {
        toast.error(res.data?.error || "Generation failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set("coverImageUrl", file_url);
      toast.success("Image uploaded");
      trackEvent("blog_featured_image_uploaded", {});
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = () => {
    set("coverImageUrl", "");
    toast.success("Image removed");
  };

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium">Featured image</p>
      </div>

      {/* Current image / placeholder */}
      <div className={`relative w-full ${RATIO_CLASS[ratio] || "aspect-video"} rounded-lg overflow-hidden border border-border bg-secondary/40`}>
        {hasImage ? (
          <img src={post.coverImageUrl} alt={post.featuredImageAlt || ""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full blueprint-grid opacity-40 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Prompt */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Image prompt</Label>
        <Textarea
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder="Describe the visual subject (no text or logos)"
          className="h-16 text-sm"
        />
      </div>

      {/* Style + ratio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {IMAGE_STYLES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Aspect ratio</Label>
          <Select value={ratio} onValueChange={setRatio}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ASPECT_RATIOS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-normal">Use brand colors</Label>
          <Switch checked={brandColors} onCheckedChange={setBrandColors} />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-normal">Include brand mark</Label>
          <Switch checked={includeLogo} onCheckedChange={setIncludeLogo} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={generate} disabled={generating} className="gap-1.5">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : hasImage ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {hasImage ? "Regenerate" : "Generate"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-1.5">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
        </Button>
        {hasImage && (
          <Button size="sm" variant="ghost" onClick={remove} className="gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" /> Remove
          </Button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
      </div>

      {!savedId && (
        <p className="text-xs text-amber-500 flex items-center gap-1"><Wand2 className="w-3 h-3" /> Save the post to enable AI generation.</p>
      )}

      {/* Alt text */}
      <div className="pt-2 border-t border-border">
        <Label className="text-xs text-muted-foreground mb-1.5 block">Alt text (accessibility)</Label>
        <Input
          value={post.featuredImageAlt || ""}
          onChange={(e) => set("featuredImageAlt", e.target.value)}
          placeholder="Describe the image for screen readers"
        />
      </div>
    </div>
  );
}