import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Upload, Loader2, AlertTriangle, CheckCircle2, Image as ImageIcon, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { REDDIT_POST_KINDS, validateRedditPayload, cleanSubreddit } from "./redditConfig";

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

// Reddit setup: subreddit, post type, title, body/URL, flair, NSFW/spoiler flags.
export default function RedditSetupForm({ reddit, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const set = (field, value) => onChange({ ...reddit, [field]: value });
  const kind = reddit.reddit_post_kind || "self";
  const { errors, warnings } = validateRedditPayload(reddit);

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set("media_url", file_url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Subreddit" required hint="Without the r/ prefix.">
          <Input
            value={reddit.subreddit || ""}
            onChange={(e) => set("subreddit", cleanSubreddit(e.target.value))}
            placeholder="webdev"
          />
        </Field>
        <Field label="Post type" required>
          <select
            value={kind}
            onChange={(e) => set("reddit_post_kind", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm"
          >
            {REDDIT_POST_KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Title" required hint={`${(reddit.title || "").length}/300 characters`}>
        <Input value={reddit.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="A clear, native-sounding title" maxLength={300} />
      </Field>

      {kind === "self" && (
        <Field label="Body" required hint="Markdown supported. Lead with value, not a pitch.">
          <Textarea rows={6} value={reddit.body || ""} onChange={(e) => set("body", e.target.value)} placeholder="Write a discussion-first post…" />
        </Field>
      )}

      {kind === "link" && (
        <Field label="Link URL" required>
          <Input value={reddit.link_url || ""} onChange={(e) => set("link_url", e.target.value)} placeholder="https://example.com/article" />
        </Field>
      )}

      {kind === "image" && (
        <Field label="Image" required>
          {reddit.media_url ? (
            <div className="space-y-2">
              <img src={reddit.media_url} alt="" className="w-full max-h-56 object-cover rounded-lg border border-border" />
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-400" onClick={() => set("media_url", "")}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5 mr-1" />}
              Upload image
            </Button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadImage} />
        </Field>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Flair text" hint="Optional — required by some subreddits.">
          <Input value={reddit.flair_text || ""} onChange={(e) => set("flair_text", e.target.value)} placeholder="e.g. Showoff Saturday" />
        </Field>
        <Field label="Flair template id" hint="Optional — from the subreddit if known.">
          <Input value={reddit.flair_id || ""} onChange={(e) => set("flair_id", e.target.value)} placeholder="Optional" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <span className="text-sm">NSFW</span>
          <Switch checked={!!reddit.nsfw} onCheckedChange={(v) => set("nsfw", v)} />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <span className="text-sm">Spoiler</span>
          <Switch checked={!!reddit.spoiler} onCheckedChange={(v) => set("spoiler", v)} />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <span className="text-sm">Reply notifications</span>
          <Switch checked={reddit.send_replies !== false} onCheckedChange={(v) => set("send_replies", v)} />
        </label>
      </div>

      <Field label="Promotion disclosure" hint="Shown if your post is about your own product.">
        <Input value={reddit.promotion_disclosure || ""} onChange={(e) => set("promotion_disclosure", e.target.value)} placeholder="Disclosure: I work on this tool." />
      </Field>

      <Field label="Suggested first comment" hint="Optional context to post as the first comment.">
        <Textarea rows={2} value={reddit.suggested_comment || ""} onChange={(e) => set("suggested_comment", e.target.value)} />
      </Field>

      <Field label="Subreddit rules notes" hint="Reviewer notes — confirm you've checked the rules.">
        <Textarea rows={2} value={reddit.subreddit_rules_notes || ""} onChange={(e) => set("subreddit_rules_notes", e.target.value)} />
      </Field>

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