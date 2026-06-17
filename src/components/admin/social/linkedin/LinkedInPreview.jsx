import React from "react";
import { Linkedin, ThumbsUp, MessageCircle, Repeat2, Send, Globe, Users, User, Building2 } from "lucide-react";
import { hasHashtags } from "./linkedinConfig";

const VISIBILITY_ICON = {
  PUBLIC: Globe,
  CONNECTIONS: Users,
  LOGGED_IN: Users,
};

// Read-only LinkedIn post preview driven by the live setup payload.
export default function LinkedInPreview({ linkedin = {}, account = null }) {
  const isOrg = linkedin.author_type === "organization";
  const org = (account?.available_organizations || []).find((o) => o.urn === linkedin.author_urn);
  const authorName = isOrg
    ? (org?.name || "Company page")
    : (account?.platform_display_name || "Your name");
  const avatar = isOrg ? org?.logo_url : account?.platform_avatar_url;
  const text = linkedin.commentary || "Your LinkedIn post text will appear here…";
  const VisIcon = VISIBILITY_ICON[linkedin.visibility || "PUBLIC"] || Globe;
  const tags = hasHashtags(linkedin.commentary || "");

  return (
    <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-background/40">
        <Linkedin className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">LinkedIn preview</span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${isOrg ? "rounded-md" : "rounded-full"} bg-secondary flex items-center justify-center shrink-0 overflow-hidden`}>
            {avatar ? (
              <img src={avatar} alt="" className="w-10 h-10 object-cover" />
            ) : isOrg ? (
              <Building2 className="w-5 h-5 text-muted-foreground" />
            ) : (
              <User className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{authorName}</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              Now • <VisIcon className="w-3 h-3" />
            </p>
          </div>
        </div>

        <p className="text-sm whitespace-pre-wrap mt-3">{text}</p>

        {linkedin.media_url && (
          <img
            src={linkedin.media_url}
            alt={linkedin.media_title || ""}
            className="mt-3 w-full max-h-72 object-cover rounded-lg border border-border"
          />
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-muted-foreground">
          <span className="flex items-center gap-1 text-xs"><ThumbsUp className="w-4 h-4" /> Like</span>
          <span className="flex items-center gap-1 text-xs"><MessageCircle className="w-4 h-4" /> Comment</span>
          <span className="flex items-center gap-1 text-xs"><Repeat2 className="w-4 h-4" /> Repost</span>
          <span className="flex items-center gap-1 text-xs"><Send className="w-4 h-4" /> Send</span>
        </div>

        {!tags && linkedin.commentary && (
          <p className="text-[11px] text-amber-400 mt-3">Tip: add 3–5 hashtags to extend reach.</p>
        )}
      </div>
    </div>
  );
}