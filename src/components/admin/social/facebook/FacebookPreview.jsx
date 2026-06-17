import React from "react";
import { Facebook, ThumbsUp, MessageCircle, Share2, Globe, AlertTriangle, ExternalLink } from "lucide-react";
import { FACEBOOK_CTA_OPTIONS, looksLikeEngagementBait, isVideoUrl } from "./facebookConfig";

// Read-only Facebook Page post preview driven by the live payload.
export default function FacebookPreview({ fb = {}, account = null }) {
  const media = (fb.media_urls || []).filter(Boolean);
  const isVideo = media[0] && isVideoUrl(media[0]);
  const ctaLabel = FACEBOOK_CTA_OPTIONS.find((c) => c.key === fb.call_to_action)?.label;
  const showCta = ctaLabel && fb.call_to_action;
  const bait = looksLikeEngagementBait(fb.message || "");

  const pageName =
    (account?.available_facebook_pages || []).find((p) => p.id === (fb.facebook_page_id || account?.selected_default_facebook_page_id))?.name
    || account?.facebook_page_name
    || "Your Page";
  const pagePic =
    account?.facebook_page_picture_url || account?.facebook_page_picture_url;

  return (
    <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-background/40">
        <Facebook className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Facebook Page preview</span>
      </div>
      <div className="p-4">
        {/* Page header */}
        <div className="flex items-center gap-2.5">
          {pagePic ? (
            <img src={pagePic} alt="" className="w-9 h-9 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30" />
          )}
          <div>
            <p className="text-sm font-semibold leading-tight">{pageName}</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              Just now · <Globe className="w-3 h-3" />
            </p>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm whitespace-pre-wrap mt-3">{fb.message || "Your Facebook post…"}</p>

        {/* Link card */}
        {(fb.post_type === "link" || (!media.length && fb.link_url)) && fb.link_url && (
          <div className="mt-3 rounded-lg border border-border overflow-hidden">
            <div className="px-3 py-2 bg-background/40">
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                <ExternalLink className="w-3 h-3 shrink-0" /> {fb.link_url}
              </p>
            </div>
          </div>
        )}

        {/* Media */}
        {media[0] && (
          <div className="mt-3 rounded-lg overflow-hidden border border-border">
            {isVideo ? (
              <video src={media[0]} controls className="w-full max-h-72" />
            ) : (
              <img src={media[0]} alt="" className="w-full max-h-72 object-cover" />
            )}
          </div>
        )}

        {/* CTA */}
        {showCta && (
          <div className="mt-3">
            <span className="inline-block rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              {ctaLabel}
            </span>
          </div>
        )}

        {/* Engagement row */}
        <div className="flex items-center gap-8 mt-4 pt-3 border-t border-border text-muted-foreground">
          <span className="flex items-center gap-1.5 text-xs"><ThumbsUp className="w-3.5 h-3.5" /> Like</span>
          <span className="flex items-center gap-1.5 text-xs"><MessageCircle className="w-3.5 h-3.5" /> Comment</span>
          <span className="flex items-center gap-1.5 text-xs"><Share2 className="w-3.5 h-3.5" /> Share</span>
        </div>

        {bait && (
          <p className="flex items-start gap-1.5 text-xs text-amber-400 mt-3">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Reads like engagement bait — Facebook may reduce reach.
          </p>
        )}
      </div>
    </div>
  );
}