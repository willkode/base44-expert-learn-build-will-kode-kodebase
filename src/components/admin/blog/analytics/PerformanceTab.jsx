import React from "react";
import { Trophy, TrendingDown, MousePointerClick, ArrowDownWideNarrow, RefreshCw, FolderTree, Tag } from "lucide-react";
import RankedList from "./RankedList";

export default function PerformanceTab({ data }) {
  if (!data) return null;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankedList
          title="Best performing posts" icon={Trophy} items={data.bestPosts}
          empty="No published post traffic yet."
          renderMeta={(p) => `${(p.pageviews || 0).toLocaleString()} views`}
        />
        <RankedList
          title="Lowest performing posts" icon={TrendingDown} items={data.worstPosts}
          renderMeta={(p) => `${(p.pageviews || 0).toLocaleString()} views`}
        />
        <RankedList
          title="High traffic, low CTA clicks" icon={MousePointerClick} items={data.highTrafficLowCta}
          empty="Nothing flagged — CTA engagement looks healthy."
          renderMeta={(p) => `${p.ctaRate || 0}% CTA`}
        />
        <RankedList
          title="Low scroll depth" icon={ArrowDownWideNarrow} items={data.lowScrollDepth}
          empty="No posts with low scroll depth."
          renderMeta={(p) => `${p.scrollDepth || 0}%`}
        />
        <RankedList
          title="Posts that need a refresh" icon={RefreshCw} items={data.needsRefresh}
          empty="Nothing needs refreshing right now."
          renderMeta={(p) => `${(p.pageviews || 0).toLocaleString()} views`}
        />
        <div className="grid grid-cols-1 gap-6">
          <RankedList
            title="Best categories" icon={FolderTree} items={data.bestCategories}
            renderMeta={(c) => `${(c.pageviews || 0).toLocaleString()}`}
          />
          <RankedList
            title="Best tags" icon={Tag} items={data.bestTags}
            renderMeta={(t) => `${(t.pageviews || 0).toLocaleString()}`}
          />
        </div>
      </div>
    </div>
  );
}