import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, AlertTriangle, CheckCircle2, Image as ImageIcon, Trash2, Plus, X as XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  TWITTER_CHAR_LIMIT, TWITTER_REPLY_SETTINGS, countChars, countHashtags, validateTwitterPayload,
} from "./twitterConfig";

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

function CharCount({ value }) {
  const n = countChars(value);
  const over = n > TWITTER_CHAR_LIMIT;
  return (
    <span className={`text-[11px] tabular-nums ${over ? "text-red-400" : n >= 260 ? "text-amber-400" : "text-muted-foreground"}`}>
      {n}/{TWITTER_CHAR_LIMIT}
    </span>
  );
}

// X/Twitter setup: primary tweet, thread, media, reply settings, quote tweet.
export default function TwitterSetupForm({ tw, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const set = (field, value) => onChange({ ...tw, [field]: value });
  const thread = Array.isArray(tw.thread) ? tw.thread : [];
  const { errors, warnings } = validateTwitterPayload(tw);

  const setThreadItem = (i, value) => {
    const next = [...thread];
    next[i] = value;
    set("thread", next);
  };
  const addThreadItem = () => set("thread", [...thread, ""]);
  const removeThreadItem = (i) => set("thread", thread.filter((_, idx) => idx !== i));

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set("media_url", file_url);
      set("media_id", ""); // re-uploaded; worker re-registers media at publish time
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <Field label="Primary tweet" required hint={`Hashtags: ${countHashtags(tw.text)}`}>
        <Textarea
          rows={4}
          value={tw.text || ""}
          onChange={(e) => set("text", e.target.value)}
          placeholder="Write the first tweet — lead with a strong hook…"
        />
        <div className="flex justify-end mt-1"><CharCount value={tw.text} /></div>
      </Field>

      {/* Thread */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="text-xs text-muted-foreground">Thread (optional)</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addThreadItem} className="h-7 px-2 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add tweet
          </Button>
        </div>
        {thread.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No replies yet. Add tweets to publish a thread.</p>
        ) : (
          <div className="space-y-2">
            {thread.map((t, i) => (
              <div key={i} className="rounded-lg border border-border bg-background/40 p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-muted-foreground">Tweet {i + 2}</span>
                  <button type="button" onClick={() => removeThreadItem(i)} className="text-muted-foreground hover:text-red-400">
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Textarea rows={2} value={t || ""} onChange={(e) => setThreadItem(i, e.target.value)} placeholder={`Reply ${i + 1}…`} />
                <div className="flex justify-end mt-1"><CharCount value={t} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      <Field label="Image" hint="Attached to the first tweet.">
        {tw.media_url ? (
          <div className="space-y-2">
            <img src={tw.media_url} alt="" className="w-full max-h-56 object-cover rounded-lg border border-border" />
            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-400" onClick={() => { set("media_url", ""); set("media_id", ""); }}>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Who can reply">
          <select
            value={tw.reply_settings || "everyone"}
            onChange={(e) => set("reply_settings", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-2 text-sm"
          >
            {TWITTER_REPLY_SETTINGS.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </Field>
        <Field label="Quote tweet id" hint="Optional — id of a tweet to quote.">
          <Input value={tw.quote_post_id || ""} onChange={(e) => set("quote_post_id", e.target.value)} placeholder="Optional" />
        </Field>
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