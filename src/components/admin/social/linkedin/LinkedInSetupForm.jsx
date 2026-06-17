import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle2, Image as ImageIcon, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import LinkedInAuthorSelector from "./LinkedInAuthorSelector";
import {
  LINKEDIN_VISIBILITY,
  LINKEDIN_MAX_LENGTH,
  validateLinkedInPayload,
  countHashtags,
} from "./linkedinConfig";

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

// LinkedIn setup: author selection, commentary, visibility, image, media title.
export default function LinkedInSetupForm({ linkedin, onChange, account }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const set = (field, value) => onChange({ ...linkedin, [field]: value });
  const { errors, warnings } = validateLinkedInPayload(linkedin, account);

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      // image_urn is resolved at publish time by the worker.
      onChange({ ...linkedin, media_url: file_url, image_urn: "" });
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const length = (linkedin.commentary || "").length;
  const tagCount = countHashtags(linkedin.commentary || "");

  return (
    <div className="space-y-4">
      <LinkedInAuthorSelector linkedin={linkedin} onChange={onChange} account={account} />

      <Field
        label="Post text"
        required
        hint={`${length.toLocaleString()}/${LINKEDIN_MAX_LENGTH.toLocaleString()} characters • ${tagCount} hashtag${tagCount === 1 ? "" : "s"}`}
      >
        <Textarea
          rows={7}
          value={linkedin.commentary || ""}
          onChange={(e) => set("commentary", e.target.value)}
          placeholder="Open with a strong hook, share an insight, and end with a clear next step…"
          maxLength={LINKEDIN_MAX_LENGTH}
        />
      </Field>

      <Field label="Visibility">
        <select
          value={linkedin.visibility || "PUBLIC"}
          onChange={(e) => set("visibility", e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm"
        >
          {LINKEDIN_VISIBILITY.map((v) => <option key={v.key} value={v.key}>{v.label}</option>)}
        </select>
      </Field>

      <Field label="Image" hint="Optional. Uploaded to LinkedIn at publish time.">
        {linkedin.media_url ? (
          <div className="space-y-2">
            <img src={linkedin.media_url} alt="" className="w-full max-h-56 object-cover rounded-lg border border-border" />
            <button
              type="button"
              onClick={() => set("media_url", "")}
              className="inline-flex items-center text-xs text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 h-9 text-sm hover:bg-secondary disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
            Upload image
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadImage} />
      </Field>

      {linkedin.media_url && (
        <Field label="Media title / alt text" hint="Describes the image for accessibility.">
          <Input value={linkedin.media_title || ""} onChange={(e) => set("media_title", e.target.value)} placeholder="e.g. Product dashboard screenshot" />
        </Field>
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
          <CheckCircle2 className="w-3.5 h-3.5" /> Required fields complete.
        </p>
      )}
    </div>
  );
}