import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Send, Trash2, Download, Loader2, CheckCircle2 } from "lucide-react";
import SocialVideoPreview from "./SocialVideoPreview";

export default function SocialVideoCard({ video, onChange, onPersist, onSend, onDiscard }) {
  const hashtagLine = (video.hashtags || []).join(" ");

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="md:w-64 shrink-0">
          <SocialVideoPreview video={video} />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-sora text-sm font-semibold">{video.title || "Untitled video"}</span>
            <Badge variant="secondary">{video.platform}</Badge>
            <Badge variant="outline">{video.durationSeconds}s</Badge>
            {video.status === "sent" && (
              <span className="flex items-center gap-1 text-xs text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" /> Sent to Ocoya
              </span>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block text-xs">Caption</Label>
            <Textarea
              rows={4}
              value={video.caption || ""}
              placeholder="Write your caption..."
              onChange={(e) => onChange({ ...video, caption: e.target.value })}
              onBlur={onPersist}
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs">AI hashtags</Label>
            <p className="rounded-lg border border-border bg-secondary/40 p-2.5 text-xs text-muted-foreground break-words">
              {hashtagLine || "None generated"}
            </p>
          </div>

          {video.error && <p className="text-sm text-destructive">{video.error}</p>}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onSend} disabled={video.busy || video.status === "sent"}>
              {video.busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Send className="mr-1.5 h-4 w-4" />}
              Send to Ocoya
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={video.videoUrl} target="_blank" rel="noreferrer">
                <Download className="mr-1.5 h-4 w-4" /> Video
              </a>
            </Button>
            {video.voiceoverUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={video.voiceoverUrl} target="_blank" rel="noreferrer">
                  <Download className="mr-1.5 h-4 w-4" /> Voice over
                </a>
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onDiscard}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}