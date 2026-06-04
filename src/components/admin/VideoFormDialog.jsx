import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const EMPTY = { title: "", category: "General", description: "", youtubeUrl: "", coverImageUrl: "", order: 0 };

export default function VideoFormDialog({ open, onOpenChange, video, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(video ? { ...EMPTY, ...video } : EMPTY);
  }, [video, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const uploadCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("coverImageUrl", file_url);
    setUploading(false);
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.youtubeUrl.trim()) return toast.error("YouTube link is required");
    setSaving(true);
    const data = {
      title: form.title,
      category: form.category,
      description: form.description,
      youtubeUrl: form.youtubeUrl,
      coverImageUrl: form.coverImageUrl,
      order: Number(form.order) || 0,
    };
    if (video?.id) await base44.entities.Video.update(video.id, data);
    else await base44.entities.Video.create(data);
    setSaving(false);
    toast.success(video ? "Video updated" : "Video added");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{video ? "Edit video" : "Add video"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1.5 block">Title</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">YouTube link</Label>
            <Input value={form.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          <div>
            <Label className="mb-1.5 block">Category</Label>
            <Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Tutorials" />
          </div>
          <div>
            <Label className="mb-1.5 block">Description</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="h-20" />
          </div>
          <div>
            <Label className="mb-1.5 block">Cover image</Label>
            {form.coverImageUrl && (
              <img src={form.coverImageUrl} alt="Cover" className="w-full h-36 object-cover rounded-lg mb-2 border border-border" />
            )}
            <Input type="file" accept="image/*" onChange={uploadCover} />
            {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
          </div>
          <div>
            <Label className="mb-1.5 block">Sort order</Label>
            <Input type="number" value={form.order} onChange={(e) => set("order", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving || uploading}>{saving ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}