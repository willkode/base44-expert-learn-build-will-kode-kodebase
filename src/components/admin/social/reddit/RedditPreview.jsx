import React from "react";
import { MessageSquare, ArrowBigUp, ArrowBigDown, MessageCircle, Share2, AlertTriangle, Link2, Image as ImageIcon } from "lucide-react";
import { looksPromotional, hasHashtags } from "./redditConfig";

// Read-only Reddit submission preview driven by the live setup payload.
export default function RedditPreview({ reddit = {} }) {
  const kind = reddit.reddit_post_kind || "self";
  const title = reddit.title || "Your Reddit post title";
  const body = reddit.body || "";
  const promo = looksPromotional(`${reddit.title || ""} ${reddit.body || ""}`);
  const tags = hasHashtags(`${reddit.title || ""} ${reddit.body || ""}`);

  return (
    <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-background/40">
        <MessageSquare className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Reddit preview</span>
      </div>
      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center text-muted-foreground pt-0.5">
            <ArrowBigUp className="w-4 h-4" />
            <span className="text-xs">1</span>
            <ArrowBigDown className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold">{reddit.subreddit ? `r/${reddit.subreddit}` : "r/subreddit"}</span>
              <span className="text-xs text-muted-foreground">• Posted by u/kodebase</span>
              {reddit.nsfw && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">NSFW</span>}
              {reddit.spoiler && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/15 text-slate-300 border border-slate-500/30">SPOILER</span>}
            </div>

            <div className="flex items-center gap-2 mt-1.5">
              {reddit.flair_text && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">{reddit.flair_text}</span>
              )}
              <p className="text-sm font-semibold">{title}</p>
            </div>

            {kind === "self" && (
              <p className="text-sm whitespace-pre-wrap mt-2 text-muted-foreground">{body || "Body text…"}</p>
            )}
            {kind === "link" && (
              <a className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-400 break-all" href={reddit.link_url || undefined}>
                <Link2 className="w-3.5 h-3.5 shrink-0" /> {reddit.link_url || "https://your-link.com"}
              </a>
            )}
            {kind === "image" && (
              reddit.media_url ? (
                <img src={reddit.media_url} alt="" className="mt-2 w-full max-h-64 object-cover rounded-lg border border-border" />
              ) : (
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground border border-dashed border-border rounded-lg px-3 py-6 justify-center">
                  <ImageIcon className="w-4 h-4" /> Image required
                </div>
              )
            )}

            <div className="flex items-center gap-5 mt-3 text-muted-foreground">
              <span className="flex items-center gap-1 text-xs"><MessageCircle className="w-4 h-4" /> Comments</span>
              <span className="flex items-center gap-1 text-xs"><Share2 className="w-4 h-4" /> Share</span>
            </div>

            {reddit.promotion_disclosure && (
              <p className="text-[11px] text-muted-foreground mt-2 italic">{reddit.promotion_disclosure}</p>
            )}
          </div>
        </div>

        {(promo || tags) && (
          <div className="mt-3 space-y-1">
            {promo && (
              <p className="flex items-start gap-1.5 text-xs text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Reads as promotional — add a disclosure and keep it discussion-first.
              </p>
            )}
            {tags && (
              <p className="flex items-start gap-1.5 text-xs text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Hashtags feel unnatural on Reddit.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}