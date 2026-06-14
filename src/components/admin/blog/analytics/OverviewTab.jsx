import React from "react";
import { Eye, Users, MousePointerClick, Clock, ArrowDownWideNarrow, Target, FileText, FolderTree } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import RankedList from "./RankedList";
import SourceBreakdown from "./SourceBreakdown";

const fmtTime = (s) => {
  if (!s) return "0s";
  const m = Math.floor(s / 60);
  return m ? `${m}m ${s % 60}s` : `${s}s`;
};

export default function OverviewTab({ data }) {
  if (!data) return null;
  const o = data.overview || {};
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Total pageviews" value={(o.totalPageviews || 0).toLocaleString()} />
        <StatCard icon={Users} label="Unique visitors" value={(o.uniqueVisitors || 0).toLocaleString()} />
        <StatCard icon={MousePointerClick} label="CTA clicks" value={(o.totalClicks || 0).toLocaleString()} hint={`${o.ctaClickRate || 0}% of views`} />
        <StatCard icon={Target} label="Conversion rate" value={`${o.conversionRate || 0}%`} hint={`${(o.totalConversions || 0).toLocaleString()} conversions`} />
        <StatCard icon={Clock} label="Avg. time on page" value={fmtTime(o.avgTimeOnPage)} />
        <StatCard icon={ArrowDownWideNarrow} label="Avg. scroll depth" value={`${o.avgScrollDepth || 0}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RankedList
          title="Top posts" icon={FileText} items={data.topPosts}
          empty="No pageviews recorded yet."
          renderMeta={(p) => `${(p.pageviews || 0).toLocaleString()} views`}
        />
        <RankedList
          title="Top categories" icon={FolderTree} items={data.topCategories}
          renderMeta={(c) => `${(c.pageviews || 0).toLocaleString()}`}
        />
        <SourceBreakdown sources={data.topSources} />
      </div>
    </div>
  );
}