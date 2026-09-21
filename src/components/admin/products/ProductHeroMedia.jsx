import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProductHeroMedia({ product }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const upload = async (event, field) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !product) return;
    const video = field === "hero_video_url";
    if (!(video ? /\.mp4$/i : /\.(jpg|jpeg|png|webp)$/i).test(file.name)) {
      toast.error(video ? "Choose an MP4 video." : "Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > (video ? 100 : 10) * 1024 * 1024) {
      toast.error(video ? "Video must be under 100 MB." : "Image must be under 10 MB.");
      return;
    }
    setBusy(true);
    setStatus("Uploading…");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (!file_url) throw new Error("The upload did not return a URL.");
      await base44.entities.Product.update(product.id, { [field]: file_url });
      setStatus(video ? "Example video saved." : "Preview image saved.");
      toast.success(video ? "Example video saved" : "Preview image saved");
    } catch (error) {
      setStatus(error.message || "Upload failed. Please try again.");
      toast.error("Couldn't save hero media");
    } finally { setBusy(false); }
  };
  return <section className="space-y-3 border-t border-border pt-4">
    <div><h3 className="text-sm font-semibold">Public hero example</h3>
      <p className="text-xs text-muted-foreground">These uploads are public and save immediately.</p></div>
    <div><Label htmlFor="hero-video">Example video (MP4)</Label>
      <Input id="hero-video" type="file" accept="video/mp4,.mp4" disabled={busy} onChange={e => upload(e, "hero_video_url")} /></div>
    <div><Label htmlFor="hero-poster">Preview image</Label>
      <Input id="hero-poster" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => upload(e, "hero_video_poster_url")} /></div>
    <p role="status" className="text-xs text-muted-foreground">{status}</p>
  </section>;
}
