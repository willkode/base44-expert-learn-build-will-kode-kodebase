import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  FileText, CheckCircle2, FileEdit, CalendarClock, AlertCircle,
  Gauge, Eye, Trophy, RefreshCw, ArrowRight,
  Sparkles, PlusCircle, ClipboardList, CalendarDays, Tags, BarChart3,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import StatCard from "@/components/shared/StatCard";

const quickActions = [
  { label: "Generate Blog Post", to: "/admin/marketing/blog/generator", icon: Sparkles },
  { label: "Create Manual Post", to: "/admin/marketing/blog/posts", icon: PlusCircle },
  { label: "Create Content Plan", to: "/admin/marketing/blog/plans", icon: ClipboardList },
  { label: "View Calendar", to: "/admin/marketing/blog/calendar", icon: CalendarDays },
  { label: "Manage Categories", to: "/admin/marketing/blog/taxonomy", icon: Tags },
  { label: "View Analytics", to: "/admin/marketing/blog/analytics", icon: BarChart3 },
  { label: "Refresh Recommendations", to: "/admin/marketing/blog/refresh", icon: RefreshCw },
];

export default function BlogDashboard() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [refreshRecs, setRefreshRecs] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.BlogPost.list("-created_date", 1000),
      base44.entities.BlogContentRefreshRecommendation.filter({ status: "open" }, "-created_date", 200),
    ]).then(([p, r]) => {
      setPosts(p);
      setRefreshRecs(r);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState label="Loading blog dashboard..." />;

  const isPublished = (p) => p.status === "published" || (!p.status && p.published);
  const published = posts.filter(isPublished);
  const drafts = posts.filter((p) => p.status === "draft");
  const scheduled = posts.filter((p) => p.status === "scheduled");
  const needsReview = posts.filter((p) => p.status === "needs_review" || p.approvalStatus === "needs_review");

  const scored = posts.filter((p) => typeof p.seoScore === "number");
  const avgSeo = scored.length ? Math.round(scored.reduce((s, p) => s + p.seoScore, 0) / scored.length) : "—";

  const nextScheduled = scheduled
    .filter((p) => p.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog"
        description="Overview of your content pipeline, SEO health, and scheduled publishing."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={FileText} label="Total Posts" value={posts.length} />
        <StatCard icon={CheckCircle2} label="Published" value={published.length} />
        <StatCard icon={FileEdit} label="Drafts" value={drafts.length} />
        <StatCard icon={CalendarClock} label="Scheduled" value={scheduled.length} />
        <StatCard icon={AlertCircle} label="Needs Review" value={needsReview.length} />
        <StatCard icon={Gauge} label="Avg SEO Score" value={avgSeo} />
        <StatCard icon={Eye} label="Total Pageviews" value="—" hint="Connect analytics" />
        <StatCard icon={Trophy} label="Best Performing" value="—" hint="Connect analytics" />
        <StatCard icon={RefreshCw} label="Needs Refresh" value={refreshRecs.length} />
        <StatCard
          icon={CalendarClock}
          label="Next Scheduled"
          value={nextScheduled ? "1" : "0"}
          hint={nextScheduled ? nextScheduled.title?.slice(0, 28) : "Nothing queued"}
        />
      </div>

      <section>
        <h2 className="font-sora font-semibold text-lg mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, to, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4 hover:border-primary/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#f87171]/15 via-[#fb923c]/15 to-[#facc15]/15 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sora font-semibold text-lg">Recent Posts</h2>
          <Link to="/admin/marketing/blog/posts" className="text-sm text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 divide-y divide-border">
          {posts.slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                {p.coverImageUrl && <img src={p.coverImageUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{(p.status || (p.published ? "published" : "draft")).replace(/_/g, " ")}</p>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground text-center">No posts yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}