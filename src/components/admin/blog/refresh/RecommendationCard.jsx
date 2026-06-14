import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Clock, XCircle, ExternalLink, Pencil, Loader2,
  Eye, MousePointerClick, TrendingDown, Search, Gauge, CheckCircle2,
} from "lucide-react";
import { recTypeMeta, PRIORITY_VARIANT, AI_APPLICABLE } from "./refreshConfig";

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2">
      <Icon className={`w-4 h-4 ${tone || "text-muted-foreground"}`} />
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground leading-none">{label}</div>
        <div className="text-sm font-semibold leading-tight">{value}</div>
      </div>
    </div>
  );
}

// One refresh recommendation: type, priority, reason, suggested changes,
// the analytics that triggered it, and action buttons.
export default function RecommendationCard({ rec, post, metrics, onFixWithAI, onMarkInProgress, onDismiss, busy }) {
  const [expanded, setExpanded] = useState(false);
  const meta = recTypeMeta(rec.recommendationType);
  const Icon = meta.icon;
  const m = metrics || {};
  const canAi = AI_APPLICABLE.has(rec.recommendationType);
  const isClosed = rec.status === "applied" || rec.status === "dismissed";

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-sora font-semibold text-sm">{meta.label}</h3>
              <Badge variant={PRIORITY_VARIANT[rec.priority] || "outline"} className="text-[11px] capitalize">{rec.priority}</Badge>
              {rec.status === "applied" && <Badge variant="outline" className="text-[11px] text-emerald-400 border-emerald-500/40"><CheckCircle2 className="w-3 h-3 mr-1" />Applied</Badge>}
              {rec.status === "in_progress" && <Badge variant="outline" className="text-[11px]">In progress</Badge>}
              {rec.status === "dismissed" && <Badge variant="outline" className="text-[11px] text-muted-foreground">Dismissed</Badge>}
            </div>
            <p className="text-sm text-foreground/90 mt-1 truncate">{post?.title || "Untitled post"}</p>
            <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
          </div>
        </div>
      </div>

      {/* Triggering analytics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
        <Metric icon={Eye} label="Views" value={(m.pageviews ?? 0).toLocaleString()} />
        <Metric icon={MousePointerClick} label="Conversions" value={(m.conversions ?? 0).toLocaleString()} />
        <Metric icon={Gauge} label="Scroll" value={`${m.maxScroll ?? 0}%`} />
        <Metric icon={Search} label="Impr." value={(m.scImpr ?? 0).toLocaleString()} />
        <Metric icon={MousePointerClick} label="CTR" value={`${m.scCtr ?? 0}%`} />
        <Metric icon={TrendingDown} label="Position" value={m.avgPosition ?? 0} tone={m.avgPosition >= 4 && m.avgPosition <= 15 ? "text-amber-400" : "text-muted-foreground"} />
      </div>

      {rec.suggestedChanges && (
        <div className="mt-4">
          <button onClick={() => setExpanded((v) => !v)} className="text-xs text-primary hover:underline">
            {expanded ? "Hide suggested changes" : "View suggested changes"}
          </button>
          {expanded && (
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line rounded-lg bg-secondary/40 border border-border p-3">
              {rec.suggestedChanges}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 mt-5">
        {!isClosed && canAi && (
          <Button size="sm" onClick={() => onFixWithAI(rec)} disabled={busy}
            className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Fix with AI
          </Button>
        )}
        {!isClosed && rec.status !== "in_progress" && (
          <Button size="sm" variant="outline" onClick={() => onMarkInProgress(rec)} disabled={busy}>
            <Clock className="w-4 h-4 mr-2" /> Mark in progress
          </Button>
        )}
        {!isClosed && (
          <Button size="sm" variant="ghost" onClick={() => onDismiss(rec)} disabled={busy}
            className="text-muted-foreground hover:text-destructive">
            <XCircle className="w-4 h-4 mr-2" /> Dismiss
          </Button>
        )}
        {post?.slug && (
          <Button asChild size="sm" variant="ghost">
            <a href={`/learn/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> View post
            </a>
          </Button>
        )}
        {post?.id && (
          <Button asChild size="sm" variant="ghost">
            <Link to={`/admin/marketing/blog/posts/${post.id}/edit`}>
              <Pencil className="w-4 h-4 mr-2" /> Edit post
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}