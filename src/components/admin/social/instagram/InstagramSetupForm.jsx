import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle2, Image as ImageIcon, Trash2, Plus, X as XIcon, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  IG_MEDIA_TYPES, IG_MEDIA_TYPE_MAP, IG_MEDIA_REQUIREMENTS, IG_CAPTION_LIMIT,
  IG_CAROUSEL_MAX, totalHashtags, validateInstagramPayload,
} from "./instagramConfig";

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

// Instagram composer: media type, media upload, caption, hashtags, first comment, alt text.
export default function InstagramSetupForm({ ig, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const set = (field, value) => onChange({ ...ig, [field]: value });
  const mediaType = ig.media_type || "image";
  const media = Array.isArray(ig.media_urls) ? ig.media_urls : [];
  const allowMultiple = mediaType === "carousel";
  const { errors, warnings } = validateInstagramPayload(ig);

  const setMediaType = (key) => {
    // When switching away from carousel, keep only the first media item.
    const next = { ...ig, media_type: key };
    if (key !== "carousel" && media.length > 1) next.media_urls = media.slice(0, 1);
    onChange(next);
  };

  const uploadMedia = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploaded.push(file_url);
        if (!allowMultiple) break; // single-media types take only the first file
      }
      const next = allowMultiple ? [...media, ...uploaded].slice(0, IG_CAROUSEL_MAX) : uploaded.slice(0, 1);
      set("media_urls", next);
      toast.success(uploaded.length > 1 ? `${uploaded.length} files uploaded.` : "Media uploaded.");
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeMedia = (i) => set("media_urls", media.filter((_, idx) => idx !== i));

  const hashtags = Array.isArray(ig.hashtags) ? ig.hashtags : [];
  const setHashtagInput = (value) => {
    const tags = value.split(/[\s,]+/).map((t) => t.trim()).filter(Boolean).map((t) => (t.startsWith("#") ? t : `#${t}`));
    set("hashtags", tags);
  };

  return (
    <div className="space-y-4">
      {/* Media type */}
      <Field label="Media type" required hint={IG_MEDIA_REQUIREMENTS[mediaType]}>
        <div className="flex flex-wrap gap-2">
          {IG_MEDIA_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setMediaType(t.key)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                mediaType === t.key ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Field>

      {/* Media upload */}
      <Field label={allowMultiple ? "Media (2–10 items)" : "Media"} required>
        {media.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {media.map((url, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden border border-border">
                {/\.(mp4|mov|m4v|webm)(\?|$)/i.test(url) ? (
                  <video src={url} className="w-full h-24 object-cover" muted />
                ) : (
                  <img src={url} alt="" className="w-full h-24 object-cover" />
                )}
                {allowMultiple && (
                  <span className="absolute top-1 left-1 text-[10px] bg-background/80 rounded px-1 flex items-center gap-0.5">
                    <GripVertical className="w-3 h-3" /> {i + 1}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(i)}
                  className="absolute top-1 right-1 bg-background/80 rounded p-0.5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {(allowMultiple || media.length === 0) && (
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : media.length ? <Plus className="w-3.5 h-3.5 mr-1" /> : <ImageIcon className="w-3.5 h-3.5 mr-1" />}
            {media.length ? "Add media" : "Upload media"}
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept={IG_MEDIA_TYPE_MAP[mediaType]?.accept || "image/*"}
          multiple={allowMultiple}
          className="hidden"
          onChange={uploadMedia}
        />
      </Field>

      {/* Caption */}
      <Field label="Caption" hint={`${(ig.caption || "").length}/${IG_CAPTION_LIMIT} · lead with a strong first line`}>
        <Textarea
          rows={5}
          value={ig.caption || ""}
          onChange={(e) => set("caption", e.target.value)}
          placeholder="Write the caption — hook in the first line, then the story…"
        />
      </Field>

      {/* Hashtags */}
      <Field label="Hashtags" hint={`${totalHashtags(ig)} total (caption + list + first comment)`}>
        <Input
          value={hashtags.join(" ")}
          onChange={(e) => setHashtagInput(e.target.value)}
          placeholder="#buildinpublic #devtools #saas"
        />
      </Field>

      {/* First comment */}
      <Field label="First comment (optional)" hint="Posted right after publishing — great for a clean hashtag block.">
        <Textarea
          rows={2}
          value={ig.first_comment || ""}
          onChange={(e) => set("first_comment", e.target.value)}
          placeholder="Add hashtags or context as the first comment…"
        />
      </Field>

      {/* Alt text */}
      <Field label="Alt text (accessibility)" hint="Describe what's shown in the media.">
        <Textarea
          rows={2}
          value={ig.alt_text || ""}
          onChange={(e) => set("alt_text", e.target.value)}
          placeholder="e.g. A dark dashboard showing a generated app blueprint with glowing orange accents."
        />
      </Field>

      {mediaType === "reel" && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={ig.share_to_feed !== false}
            onChange={(e) => set("share_to_feed", e.target.checked)}
            className="rounded border-border"
          />
          Also share this Reel to the main feed
        </label>
      )}

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