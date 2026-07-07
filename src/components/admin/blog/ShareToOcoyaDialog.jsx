import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import OcoyaProfilePicker from "@/components/admin/ocoya/OcoyaProfilePicker";
import { trackEvent } from "@/lib/analytics";

const SITE_URL = "https://kodebase.us";

// Default the schedule to a few minutes from now, in datetime-local format.
const asapValue = () => {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function ShareToOcoyaDialog({ post, open, onOpenChange }) {
  const [workspaceId, setWorkspaceId] = useState("");
  const [caption, setCaption] = useState("");
  const [generating, setGenerating] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [scheduledAt, setScheduledAt] = useState(asapValue());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !post) return;
    setCaption("");
    setSelectedProfiles([]);
    setScheduledAt(asapValue());
    setSent(false);
    setError(null);
    setGenerating(true);

    const stored = localStorage.getItem("ocoya_workspace");
    const wsPromise = stored
      ? Promise.resolve(stored)
      : base44.functions.invoke("ocoyaRequest", { action: "workspaces" }).then((res) => {
          const list = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.workspaces || [];
          return list[0]?.id || "";
        });

    wsPromise.then(setWorkspaceId).catch(() => {});

    const postUrl = `${SITE_URL}/learn/blog/${post.slug}`;
    base44.functions
      .invoke("generateOcoyaPostContent", {
        instructions: `Promote this new blog post from our site to drive clicks. Title: "${post.title}". Summary: ${post.excerpt || post.seoDescription || ""}. The post lives at ${postUrl} — include that exact link in the caption as the call to action.`,
        includeImage: false,
      })
      .then((res) => {
        if (res.data?.caption) setCaption(res.data.caption);
        else if (res.data?.error) setError(res.data.error);
      })
      .catch((e) => setError(e?.response?.data?.error || e.message))
      .finally(() => setGenerating(false));
  }, [open, post]);

  const handleSend = async () => {
    setError(null);
    if (!caption.trim()) return setError("Write or generate a caption first.");
    if (selectedProfiles.length === 0) return setError("Select at least one social profile.");
    setSending(true);
    const payload = {
      action: "createPost",
      workspaceId,
      caption,
      socialProfileIds: selectedProfiles,
      scheduledAt: new Date(scheduledAt).toISOString(),
    };
    if (post.coverImageUrl) payload.mediaUrls = [post.coverImageUrl];
    try {
      const res = await base44.functions.invoke("ocoyaRequest", payload);
      if (res.data?.error) {
        setError(res.data.error);
      } else {
        trackEvent("blog_post_shared_to_ocoya", { post_id: post.id });
        setSent(true);
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Sending to Ocoya failed.");
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send to Ocoya</DialogTitle>
          <DialogDescription>{post?.title}</DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="font-medium mb-1">Sent to Ocoya</p>
            <p className="text-sm text-muted-foreground mb-5">Your post is queued to go out at the selected time.</p>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Caption</Label>
              {generating ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center border border-border rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" /> Writing your post...
                </div>
              ) : (
                <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={8} />
              )}
            </div>

            {post?.coverImageUrl && (
              <div className="space-y-2">
                <Label>Image (post cover)</Label>
                <img src={post.coverImageUrl} alt="" className="rounded-lg w-full max-w-xs border border-border" />
              </div>
            )}

            <div className="space-y-2">
              <Label>Profiles</Label>
              <OcoyaProfilePicker workspaceId={workspaceId} selected={selectedProfiles} onChange={setSelectedProfiles} />
            </div>

            <div className="space-y-2">
              <Label>Publish time (defaults to ASAP)</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="max-w-xs" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              onClick={handleSend}
              disabled={sending || generating}
              className="w-full font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
            >
              {sending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
              Send to Ocoya
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}