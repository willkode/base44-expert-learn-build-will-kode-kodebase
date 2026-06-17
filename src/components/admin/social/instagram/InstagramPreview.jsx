import React from "react";
import { Instagram, Heart, MessageCircle, Send, Bookmark, AlertTriangle, Layers, Film } from "lucide-react";
import { totalHashtags, IG_HASHTAG_WARN, IG_MEDIA_TYPE_MAP } from "./instagramConfig";

function isVideo(url) {
  return /\.(mp4|mov|m4v|webm)(\?|$)/i.test(url || "");
}

// Read-only Instagram post preview driven by the live payload.
export default function InstagramPreview({ ig = {}, account }) {
  const media = (ig.media_urls || []).filter((m) => (m || "").trim());
  const mediaType = ig.media_type || "image";
  const tags = totalHashtags(ig);
  const tooManyTags = tags > IG_HASHTAG_WARN;
  const username = account?.instagram_username || account?.platform_username || "yourbrand";
  const avatar = account?.instagram_profile_picture_url;
  const first = media[0];

  return (
    <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-background/40">
        <Instagram className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Instagram preview</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground ml-auto capitalize">
          {IG_MEDIA_TYPE_MAP[mediaType]?.label || mediaType}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        {avatar ? (
          <img src={avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30" />
        )}
        <span className="text-sm font-semibold">@{username}</span>
      </div>

      {/* Media */}
      <div className="relative bg-background/60 aspect-square w-full flex items-center justify-center overflow-hidden">
        {first ? (
          isVideo(first) ? (
            <video src={first} className="w-full h-full object-cover" muted />
          ) : (
            <img src={first} alt={ig.alt_text || ""} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="text-center text-muted-foreground text-xs px-6">
            <Instagram className="w-8 h-8 mx-auto mb-2 opacity-40" />
            Upload media to preview — Instagram posts can't be text-only.
          </div>
        )}
        {mediaType === "carousel" && media.length > 1 && (
          <span className="absolute top-2 right-2 text-[10px] bg-background/80 rounded-full px-2 py-0.5 flex items-center gap-1">
            <Layers className="w-3 h-3" /> 1/{media.length}
          </span>
        )}
        {(mediaType === "reel" || mediaType === "video") && (
          <span className="absolute top-2 right-2 text-[10px] bg-background/80 rounded-full px-2 py-0.5 flex items-center gap-1">
            <Film className="w-3 h-3" /> {mediaType === "reel" ? "Reel" : "Video"}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 px-3 py-2 text-foreground">
        <Heart className="w-5 h-5" />
        <MessageCircle className="w-5 h-5" />
        <Send className="w-5 h-5" />
        <Bookmark className="w-5 h-5 ml-auto" />
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-sm whitespace-pre-wrap">
          <span className="font-semibold mr-1">@{username}</span>
          {ig.caption || <span className="text-muted-foreground">Your caption…</span>}
        </p>
        {(ig.hashtags || []).filter(Boolean).length > 0 && (
          <p className="text-sm text-primary/80 mt-1">{(ig.hashtags || []).filter(Boolean).join(" ")}</p>
        )}
        {ig.first_comment && (
          <p className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">
            <span className="font-semibold">@{username}</span> {ig.first_comment}
          </p>
        )}
        {tooManyTags && (
          <p className="flex items-start gap-1.5 text-xs text-amber-400 mt-2">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {tags} hashtags — 5–15 focused tags perform best.
          </p>
        )}
      </div>
    </div>
  );
}