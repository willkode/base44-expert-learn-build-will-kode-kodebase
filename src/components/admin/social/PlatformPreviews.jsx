import React from "react";
import { Twitter, Linkedin, Facebook, Instagram, MessageSquare, Heart, MessageCircle, Repeat2, Bookmark, ArrowBigUp } from "lucide-react";

// Lightweight, read-only previews of how a post renders per platform.
// Pure presentational — no data fetching, no posting logic.

function Avatar({ label }) {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f87171]/30 via-[#fb923c]/30 to-[#facc15]/30 flex items-center justify-center text-xs font-semibold shrink-0">
      {label}
    </div>
  );
}

function Frame({ icon: Icon, name, children }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-background/40">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function HashtagLine({ tags }) {
  if (!tags || tags.length === 0) return null;
  return <p className="text-sm text-blue-400 mt-2">{tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")}</p>;
}

function MediaBlock({ url, alt }) {
  if (!url) return null;
  return <img src={url} alt={alt || ""} className="mt-3 w-full rounded-lg border border-border object-cover max-h-72" />;
}

export function TwitterPreview({ post = {} }) {
  const v = post.platform_variants || {};
  const text = v.twitter_text || post.content || "Your post text will appear here.";
  const thread = v.twitter_thread || [];
  return (
    <Frame icon={Twitter} name="X / Twitter">
      <div className="flex gap-3">
        <Avatar label="KB" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">KodeBase <span className="text-muted-foreground font-normal">@kodebase</span></p>
          <p className="text-sm whitespace-pre-wrap mt-1">{text}</p>
          <HashtagLine tags={post.hashtags} />
          <MediaBlock url={post.image_url} alt={post.image_alt_text} />
          {thread.length > 0 && (
            <div className="mt-3 space-y-2 border-l-2 border-border pl-3">
              {thread.map((t, i) => <p key={i} className="text-sm text-muted-foreground whitespace-pre-wrap">{t}</p>)}
            </div>
          )}
          <div className="flex items-center gap-6 mt-3 text-muted-foreground">
            <MessageCircle className="w-4 h-4" /><Repeat2 className="w-4 h-4" /><Heart className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function RedditPreview({ post = {} }) {
  const v = post.platform_variants || {};
  return (
    <Frame icon={MessageSquare} name="Reddit">
      <div className="flex gap-3">
        <div className="flex flex-col items-center text-muted-foreground pt-1">
          <ArrowBigUp className="w-4 h-4" /><span className="text-xs">•</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">r/subreddit • Posted by u/kodebase</p>
          <p className="text-sm font-semibold mt-1">{v.reddit_title || "Your Reddit post title"}</p>
          <p className="text-sm whitespace-pre-wrap mt-1 text-muted-foreground">{v.reddit_body || post.content || "Body text..."}</p>
          <MediaBlock url={post.image_url} alt={post.image_alt_text} />
        </div>
      </div>
    </Frame>
  );
}

export function LinkedinPreview({ post = {} }) {
  const v = post.platform_variants || {};
  return (
    <Frame icon={Linkedin} name="LinkedIn">
      <div className="flex gap-3">
        <Avatar label="KB" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">KodeBase</p>
          <p className="text-xs text-muted-foreground">Software • Promoted</p>
          <p className="text-sm whitespace-pre-wrap mt-2">{v.linkedin_text || post.content || "Your LinkedIn post..."}</p>
          <HashtagLine tags={post.hashtags} />
          <MediaBlock url={post.image_url} alt={post.image_alt_text} />
        </div>
      </div>
    </Frame>
  );
}

export function FacebookPreview({ post = {} }) {
  const v = post.platform_variants || {};
  return (
    <Frame icon={Facebook} name="Facebook Page">
      <div className="flex gap-3">
        <Avatar label="KB" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">KodeBase</p>
          <p className="text-xs text-muted-foreground">Page • Just now</p>
          <p className="text-sm whitespace-pre-wrap mt-2">{v.facebook_text || post.content || "Your Facebook post..."}</p>
          <MediaBlock url={(v.facebook_media_urls && v.facebook_media_urls[0]) || post.image_url} alt={post.image_alt_text} />
          {v.facebook_cta && (
            <div className="mt-3 rounded-lg border border-border bg-background/40 px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground truncate">{v.facebook_link_url || "Learn more"}</span>
              <span className="text-xs font-semibold text-primary">{v.facebook_cta}</span>
            </div>
          )}
        </div>
      </div>
    </Frame>
  );
}

export function InstagramPreview({ post = {} }) {
  const v = post.platform_variants || {};
  const media = (v.instagram_media_urls && v.instagram_media_urls[0]) || post.image_url;
  return (
    <Frame icon={Instagram} name="Instagram">
      <div className="flex items-center gap-2 mb-3">
        <Avatar label="KB" />
        <span className="text-sm font-semibold">kodebase</span>
      </div>
      {media ? (
        <img src={media} alt={v.instagram_alt_text || post.image_alt_text || ""} className="w-full rounded-lg border border-border object-cover aspect-square" />
      ) : (
        <div className="w-full aspect-square rounded-lg border border-dashed border-border bg-background/40 flex items-center justify-center text-xs text-muted-foreground">
          Image required for Instagram
        </div>
      )}
      <div className="flex items-center gap-4 mt-3 text-muted-foreground">
        <Heart className="w-5 h-5" /><MessageCircle className="w-5 h-5" /><Bookmark className="w-5 h-5 ml-auto" />
      </div>
      <p className="text-sm whitespace-pre-wrap mt-2"><span className="font-semibold">kodebase</span> {v.instagram_caption || post.content || "Your caption..."}</p>
      <HashtagLine tags={v.instagram_hashtags || post.hashtags} />
      {v.instagram_first_comment && <p className="text-xs text-muted-foreground mt-2">First comment: {v.instagram_first_comment}</p>}
    </Frame>
  );
}

export const PREVIEW_MAP = {
  twitter: TwitterPreview,
  reddit: RedditPreview,
  linkedin: LinkedinPreview,
  facebook: FacebookPreview,
  instagram: InstagramPreview,
};