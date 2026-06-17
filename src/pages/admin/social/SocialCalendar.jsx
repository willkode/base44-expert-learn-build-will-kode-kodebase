import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, ChevronLeft, ChevronRight, Wand2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { PLATFORMS, PLATFORM_MAP } from "@/components/admin/social/socialConfig";
import PublishingQueue from "@/components/admin/social/publishing/PublishingQueue";
import AutoFillDialog from "@/components/admin/social/calendar/AutoFillDialog";
import { trackEvent } from "@/lib/analytics";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SocialCalendar() {
  const [loading, setLoading] = useState(true);
  const [scheduled, setScheduled] = useState([]);
  const [cursor, setCursor] = useState(new Date());
  const [platformFilter, setPlatformFilter] = useState("all");
  const [autoFillOpen, setAutoFillOpen] = useState(false);

  const loadScheduled = () =>
    base44.entities.ScheduledPost.list("-scheduled_at", 1000).then((s) => {
      setScheduled(s);
      setLoading(false);
    });

  useEffect(() => {
    trackEvent("admin_social_calendar_view");
    loadScheduled();
  }, []);

  if (loading) return <LoadingState label="Loading calendar..." />;

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const filtered = scheduled.filter((s) => platformFilter === "all" || s.platform === platformFilter);
  const postsForDay = (day) =>
    filtered.filter((s) => {
      if (!s.scheduled_at) return false;
      const d = new Date(s.scheduled_at);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Calendar"
        description="View scheduled posts by month. Filter by platform to focus your plan."
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => setAutoFillOpen(true)}><Wand2 className="w-4 h-4 mr-1.5" /> Auto-Fill Calendar</Button>
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm font-medium w-36 text-center">{monthLabel}</span>
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        }
      />

      <AutoFillDialog open={autoFillOpen} onOpenChange={setAutoFillOpen} onScheduled={loadScheduled} />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPlatformFilter("all")}
          className={`px-3 py-1.5 rounded-lg border text-sm ${platformFilter === "all" ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
        >
          All Platforms
        </button>
        {PLATFORMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setPlatformFilter(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm ${platformFilter === key ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-3 sm:p-5 overflow-x-auto">
        <div className="grid grid-cols-7 gap-1.5 min-w-[640px]">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-xs font-medium text-muted-foreground text-center py-2">{w}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />;
            const posts = postsForDay(day);
            return (
              <div key={day} className="min-h-[88px] rounded-lg border border-border bg-background/40 p-2">
                <span className="text-xs text-muted-foreground">{day}</span>
                <div className="space-y-1 mt-1">
                  {posts.slice(0, 3).map((p) => {
                    const P = PLATFORM_MAP[p.platform];
                    return (
                      <div key={p.id} className="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5">
                        {P?.icon && <P.icon className="w-3 h-3 text-primary shrink-0" />}
                        <span className="text-[10px] text-primary truncate">
                          {new Date(p.scheduled_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })}
                  {posts.length > 3 && <span className="text-[10px] text-muted-foreground">+{posts.length - 3} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {scheduled.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4" /> No scheduled posts yet. Approved posts can be scheduled from the Content Studio.
        </div>
      )}

      <PublishingQueue />
    </div>
  );
}