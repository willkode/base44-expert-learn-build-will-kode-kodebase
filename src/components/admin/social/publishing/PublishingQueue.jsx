import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Send, Loader2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScheduledPostRow from "./ScheduledPostRow";

const FILTERS = [
  { key: "active", label: "Queued & failed", match: (s) => ["queued", "processing", "failed"].includes(s) },
  { key: "published", label: "Published", match: (s) => s === "published" },
  { key: "all", label: "All", match: () => true },
];

export default function PublishingQueue() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [postMap, setPostMap] = useState({});
  const [filter, setFilter] = useState("active");
  const [busyId, setBusyId] = useState(null);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    const all = await base44.entities.ScheduledPost.list("-scheduled_at", 200);
    setJobs(all);
    const ids = [...new Set(all.map((j) => j.social_post_id).filter(Boolean))];
    const posts = await Promise.all(ids.map((id) => base44.entities.SocialPost.get(id).catch(() => null)));
    const map = {};
    posts.forEach((p) => { if (p) map[p.id] = p; });
    setPostMap(map);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (job, action) => {
    setBusyId(job.id);
    try {
      const res = await base44.functions.invoke("manageScheduledSocialPost", { scheduled_post_id: job.id, action });
      if (res?.data?.error) throw new Error(res.data.error);
      toast.success(action === "retry" ? "Re-queued for publishing." : "Scheduled post canceled.");
      await load();
    } catch (e) {
      toast.error(e.message || "Action failed.");
    }
    setBusyId(null);
  };

  const runNow = async () => {
    setRunning(true);
    try {
      const res = await base44.functions.invoke("processScheduledSocialPosts", {});
      if (res?.data?.error) throw new Error(res.data.error);
      const r = res.data;
      toast.success(`Processed ${r.processed} • ${r.published} published • ${r.failed} failed`);
      await load();
    } catch (e) {
      toast.error(e.message || "Run failed.");
    }
    setRunning(false);
  };

  const active = FILTERS.find((f) => f.key === filter);
  const visible = jobs.filter((j) => active.match(j.status));
  const failedCount = jobs.filter((j) => j.status === "failed").length;

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" />
          <h2 className="font-sora font-semibold">Publishing Queue</h2>
          {failedCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
              {failedCount} failed
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={runNow} disabled={running}>
          {running ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5 mr-1" />}
          Run now
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg border text-sm ${filter === f.key ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No posts in this view.</p>
      ) : (
        <div className="space-y-2.5">
          {visible.map((job) => (
            <ScheduledPostRow
              key={job.id}
              job={job}
              post={postMap[job.social_post_id]}
              onRetry={(j) => act(j, "retry")}
              onCancel={(j) => act(j, "cancel")}
              busyId={busyId}
            />
          ))}
        </div>
      )}
    </div>
  );
}