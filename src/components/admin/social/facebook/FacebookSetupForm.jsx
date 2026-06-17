import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle2, Image as ImageIcon, Trash2, Facebook } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  FACEBOOK_POST_TYPES, FACEBOOK_CTA_OPTIONS, validateFacebookPayload, isVideoUrl,
} from "./facebookConfig";

function Field({ label, hint, required, children }) {
  return (
    <div>
      <Label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

// Facebook Page composer: select Page, write text, add link/media, choose type + CTA.
export default function FacebookSetupForm({ fb, onChange, account }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const set = (field, value) => onChange({ ...fb, [field]: value });
  const { errors, warnings } = validateFacebookPayload(fb, account);

  const pages = account?.available_facebook_pages?.length
    ? account.available_facebook_pages
    : (account?.facebook_page_id
      ? [{ id: account.facebook_page_id, name: account.facebook_page_name || "Connected Page", category: account.facebook_page_category }]
      : []);

  const selectedPageId = fb.facebook_page_id || account?.selected_default_facebook_page_id || account?.facebook_page_id || "";
  const ctaEligible = fb.post_type === "link" || fb.post_type === "photo";

  const uploadMedia = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set("media_urls", [file_url]);
      // Auto-pick post type from the uploaded media.
      set("post_type", isVideoUrl(file_url) || (file.type || "").startsWith("video") ? "video" : "photo");
      toast.success("Media uploaded.");
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const media = (fb.media_urls || []).filter(Boolean);
  const mediaIsVideo = media[0] && isVideoUrl(media[0]);

  return (
    <div className="space-y-4">
      {/* Page selector */}
      <Field label="Facebook Page" required hint="Posts publish to this Page. Personal profiles are not supported.">
        {pages.length === 0 ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
            No Facebook Page available. Connect a Page in Connections first.
          </div>
        ) : (
          <select
            value={selectedPageId}
            onChange={(e) => set("facebook_page_id", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm"
          >
            <option value="">Select a Page…</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>{p.name}{p.category ? ` · ${p.category}` : ""}</option>
            ))}
          </select>
        )}
      </Field>

      {/* Post type */}
      <Field label="Post type">
        <select
          value={fb.post_type || "text"}
          onChange={(e) => set("post_type", e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm"
        >
          {FACEBOOK_POST_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <p className="text-[11px] text-muted-foreground mt-1">
          {FACEBOOK_POST_TYPES.find((t) => t.key === (fb.post_type || "text"))?.help}
        </p>
      </Field>

      {/* Message */}
      <Field label="Post text" hint="The message shown in the Page feed.">
        <Textarea
          rows={5}
          value={fb.message || ""}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Write your Facebook Page post…"
        />
      </Field>

      {/* Link */}
      {(fb.post_type === "link" || fb.post_type === "text") && (
        <Field label={fb.post_type === "link" ? "Link URL" : "Link URL (optional)"} required={fb.post_type === "link"}>
          <Input
            value={fb.link_url || ""}
            onChange={(e) => set("link_url", e.target.value)}
            placeholder="https://…"
          />
        </Field>
      )}

      {/* Media */}
      {(fb.post_type === "photo" || fb.post_type === "video") && (
        <Field label={fb.post_type === "video" ? "Video" : "Image"} required hint="Required for photo and video posts.">
          {media[0] ? (
            <div className="space-y-2">
              {mediaIsVideo ? (
                <video src={media[0]} controls className="w-full max-h-56 rounded-lg border border-border" />
              ) : (
                <img src={media[0]} alt="" className="w-full max-h-56 object-cover rounded-lg border border-border" />
              )}
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-400" onClick={() => set("media_urls", [])}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5 mr-1" />}
              Upload {fb.post_type === "video" ? "video" : "image"}
            </Button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={fb.post_type === "video" ? "video/*" : "image/*"}
            className="hidden"
            onChange={uploadMedia}
          />
        </Field>
      )}

      {/* CTA */}
      {ctaEligible && (
        <Field label="Call-to-action button" hint="Optional button shown with the post (where supported).">
          <select
            value={fb.call_to_action || ""}
            onChange={(e) => set("call_to_action", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm"
          >
            {FACEBOOK_CTA_OPTIONS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </Field>
      )}

      {/* Permission note */}
      <div className="flex items-start gap-1.5 rounded-lg border border-border bg-background/40 px-3 py-2 text-[11px] text-muted-foreground">
        <Facebook className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
        Facebook posting requires a connected Facebook Page and the correct Meta permissions. Personal profile posting is not supported by this workflow.
      </div>

      {/* Validation feedback */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 space-y-1">
          {errors.map((er, i) => (
            <p key={i} className="flex items-start gap-1.5 text-xs text-red-400">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {er}
            </p>
          ))}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((w, i) => (
            <p key={i} className="flex items-start gap-1.5 text-xs text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {w}
            </p>
          ))}
        </div>
      )}
      {errors.length === 0 && (
        <p className="flex items-center gap-1.5 text-xs text-green-400">
          <CheckCircle2 className="w-3.5 h-3.5" /> Ready to post.
        </p>
      )}
    </div>
  );
}