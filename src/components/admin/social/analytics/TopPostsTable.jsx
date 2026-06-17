import React from "react";
import { ExternalLink } from "lucide-react";
import { PLATFORM_MAP } from "@/components/admin/social/socialConfig";
import { compactNumber, rowEngagement, rowImpressions } from "./analyticsConfig";

export default function TopPostsTable({ rows, postsById = {}, onSelect, limit = 10 }) {
  const ranked = [...rows]
    .sort((a, b) => rowEngagement(b) - rowEngagement(a))
    .slice(0, limit);

  if (!ranked.length) {
    return <p className="text-sm text-muted-foreground py-6 text-center">No post data yet.</p>;
  }

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground border-b border-border">
            <th className="font-medium py-2 pr-3">Post</th>
            <th className="font-medium py-2 px-3">Platform</th>
            <th className="font-medium py-2 px-3 text-right">Impr.</th>
            <th className="font-medium py-2 px-3 text-right">Eng.</th>
            <th className="font-medium py-2 px-3 text-right">Rate</th>
            <th className="font-medium py-2 pl-3 text-right">Link</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((r) => {
            const post = postsById[r.social_post_id];
            const Icon = PLATFORM_MAP[r.platform]?.icon;
            const imp = rowImpressions(r);
            const eng = rowEngagement(r);
            const rate = imp > 0 ? ((eng / imp) * 100).toFixed(1) + "%" : (r.engagement_rate ? r.engagement_rate + "%" : "—");
            return (
              <tr
                key={r.id}
                className={`border-b border-border/60 ${onSelect ? "cursor-pointer hover:bg-secondary/40" : ""}`}
                onClick={onSelect ? () => onSelect(r) : undefined}
              >
                <td className="py-2.5 pr-3 max-w-[260px]">
                  <span className="line-clamp-1 text-foreground">
                    {post?.title_internal || post?.content?.slice(0, 60) || r.platform_post_id || "Untitled post"}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {PLATFORM_MAP[r.platform]?.label || r.platform}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right text-muted-foreground">{compactNumber(imp)}</td>
                <td className="py-2.5 px-3 text-right font-medium">{compactNumber(eng)}</td>
                <td className="py-2.5 px-3 text-right text-muted-foreground">{rate}</td>
                <td className="py-2.5 pl-3 text-right">
                  {r.platform_post_url ? (
                    <a
                      href={r.platform_post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}