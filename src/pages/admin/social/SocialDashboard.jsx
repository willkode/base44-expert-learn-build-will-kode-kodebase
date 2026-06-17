import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Plug, CalendarClock, Send, AlertTriangle, Activity, TrendingUp, Clock,
  Facebook, Instagram, Sparkles, Megaphone, CalendarDays, BarChart3, PenSquare,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/admin/social/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/analytics";
import {
  PLATFORM_MAP, CONNECTION_STATUS_STYLES, JOB_STATUS_STYLES, prettyLabel, formatDateTime,
} from "@/components/admin/social/socialConfig";

const quickActions = [
  { label: "Create Post", to: "/admin/marketing/social/studio", icon: PenSquare },
  { label: "Generate Campaign", to: "/admin/marketing/social/campaigns", icon: Megaphone },
  { label: "Connect Platform", to: "/admin/marketing/social/connections", icon: Plug },
  { label: "Connect Facebook Page", to: "/admin/marketing/social/connections", icon: Facebook },
  { label: "Connect Instagram Account", to: "/admin/marketing/social/connections", icon: Instagram },
  { label: "View Calendar", to: "/admin/marketing/social/calendar", icon: CalendarDays },
  { label: "View Analytics", to: "/admin/marketing/social/analytics", icon: BarChart3 },
];

export default function SocialDashboard() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    trackEvent("admin_social_dashboard_view");
    Promise.all([
      base44.entities.SocialAccount.list("-created_date", 200),
      base44.entities.ScheduledPost.list("-scheduled_at", 500),
      base44.entities.SocialPostAnalytics.list("-collected_at", 500),
    ]).then(([acc, sch, an]) => {
      setAccounts(acc);
      setScheduled(sch);
      setAnalytics(an);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState label="Loading social dashboard..." />;

  const connected = accounts.filter((a) => a.connection_status === "connected");
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const upcoming = scheduled
    .filter((s) => s.status === "queued" && s.scheduled_at && new Date(s.scheduled_at) >= now)
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  const publishedThisWeek = scheduled.filter(
    (s) => s.status === "published" && s.last_attempt_at && new Date(s.last_attempt_at) >= weekAgo
  ).length;
  const failed = scheduled.filter((s) => s.status === "failed");

  const totalEngagement = analytics.reduce(
    (sum, a) => sum + (a.likes || 0) + (a.comments || 0) + (a.shares || 0) + (a.reposts || 0) + (a.saves || 0) + (a.upvotes || 0),
    0
  );
  const platformEngagement = {};
  analytics.forEach((a) => {
    const e = (a.likes || 0) + (a.comments || 0) + (a.shares || 0) + (a.reposts || 0) + (a.saves || 0) + (a.upvotes || 0);
    platformEngagement[a.platform] = (platformEngagement[a.platform] || 0) + e;
  });
  const bestPlatform = Object.entries(platformEngagement).sort((a, b) => b[1] - a[1])[0];
  const nextPost = upcoming[0];

  const fbAccount = accounts.find((a) => a.platform === "facebook");
  const igAccount = accounts.find((a) => a.platform === "instagram");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Media Marketing"
        description="Plan, generate, schedule and track posts across all your social channels."
        actions={
          <Badge variant={connected.length ? "default" : "secondary"} className="flex items-center gap-1.5 px-3 py-1.5">
            <Plug className="w-3.5 h-3.5" />
            {connected.length ? `${connected.length} connected` : "No accounts connected"}
          </Badge>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard icon={Plug} label="Connected Accounts" value={connected.length} />
        <StatCard icon={CalendarClock} label="Scheduled Posts" value={upcoming.length} />
        <StatCard icon={Send} label="Published This Week" value={publishedThisWeek} />
        <StatCard icon={AlertTriangle} label="Failed Posts" value={failed.length} />
        <StatCard icon={Activity} label="Total Engagement" value={totalEngagement.toLocaleString()} />
        <StatCard
          icon={TrendingUp}
          label="Best Platform"
          value={bestPlatform ? prettyLabel(PLATFORM_MAP[bestPlatform[0]]?.label || bestPlatform[0]) : "—"}
        />
        <StatCard
          icon={Clock}
          label="Next Scheduled"
          value={nextPost ? formatDateTime(nextPost.scheduled_at) : "—"}
        />
        <StatCard
          icon={Facebook}
          label="Facebook Page"
          value={fbAccount ? prettyLabel(fbAccount.connection_status) : "Not connected"}
        />
        <StatCard
          icon={Instagram}
          label="Instagram Account"
          value={igAccount ? prettyLabel(igAccount.connection_status) : "Not connected"}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sora font-semibold">Upcoming Scheduled Posts</h2>
            <Link to="/admin/marketing/social/calendar" className="text-sm text-primary hover:underline">View calendar</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No upcoming scheduled posts.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.slice(0, 6).map((s) => {
                const P = PLATFORM_MAP[s.platform];
                return (
                  <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {P?.icon && <P.icon className="w-4 h-4 text-muted-foreground shrink-0" />}
                      <span className="text-sm truncate">{P?.label || s.platform}</span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(s.scheduled_at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sora font-semibold">Failed Posts — Needs Action</h2>
            <Link to="/admin/marketing/social/logs" className="text-sm text-primary hover:underline">View logs</Link>
          </div>
          {failed.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No failed posts. Everything is healthy.</p>
          ) : (
            <ul className="space-y-2">
              {failed.slice(0, 6).map((s) => {
                const P = PLATFORM_MAP[s.platform];
                return (
                  <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {P?.icon && <P.icon className="w-4 h-4 text-red-400 shrink-0" />}
                      <span className="text-sm truncate">{s.error_message || "Publishing failed"}</span>
                    </div>
                    <StatusBadge value={s.status} styleMap={JOB_STATUS_STYLES} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="font-sora font-semibold mb-4">Connected Accounts</h2>
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No accounts connected yet. <Link to="/admin/marketing/social/connections" className="text-primary hover:underline">Connect a platform</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accounts.map((a) => {
              const P = PLATFORM_MAP[a.platform];
              return (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {P?.icon && <P.icon className="w-4 h-4 text-muted-foreground shrink-0" />}
                    <span className="text-sm truncate">{a.platform_display_name || a.platform_username || P?.label || a.platform}</span>
                  </div>
                  <StatusBadge value={a.connection_status} styleMap={CONNECTION_STATUS_STYLES} />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}