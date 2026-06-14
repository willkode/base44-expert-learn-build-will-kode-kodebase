import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  CheckCircle2, AlertTriangle, XCircle, Loader2, Sparkles, Gauge, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_COLOR = {
  excellent: "text-green-500",
  good: "text-emerald-400",
  fair: "text-amber-500",
  poor: "text-destructive",
};

const FIX_ACTIONS = [
  { action: "improve_title", label: "Improve title" },
  { action: "improve_meta_description", label: "Improve meta description" },
  { action: "improve_intro", label: "Improve intro" },
  { action: "add_faq", label: "Add FAQ" },
  { action: "add_cta", label: "Add CTA" },
  { action: "improve_headings", label: "Improve headings" },
  { action: "suggest_internal_links", label: "Suggest internal links" },
  { action: "reduce_keyword_stuffing", label: "Reduce keyword stuffing" },
];

// Backend has no dedicated handler for internal-link suggestions; treat it as a heading/link improvement pass.
const ACTION_MAP = { suggest_internal_links: "improve_headings" };

function ChecklistRow({ icon, color, text }) {
  return (
    <li className="flex items-start gap-2 text-xs leading-relaxed">
      <span className={`mt-0.5 shrink-0 ${color}`}>{icon}</span>
      <span className="text-muted-foreground">{text}</span>
    </li>
  );
}

export default function SeoScorePanel({ postId, onFieldFixed, onAnalysis, content }) {
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [fixing, setFixing] = useState(null);

  const analyze = useCallback(async () => {
    if (!postId) { toast.error("Save the post before analyzing SEO"); return; }
    setAnalyzing(true);
    try {
      const res = await base44.functions.invoke("analyzeBlogSEO", { blog_post_id: postId });
      if (res.data?.success) { setAnalysis(res.data); onAnalysis?.(res.data); }
      else toast.error(res.data?.error || "Analysis failed");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }, [postId, onAnalysis]);

  const runFix = async ({ action }) => {
    if (!postId) { toast.error("Save the post first"); return; }
    setFixing(action);
    try {
      const mapped = ACTION_MAP[action] || action;
      const res = await base44.functions.invoke("fixBlogSEOWithAI", { blog_post_id: postId, action: mapped });
      if (res.data?.success) {
        onFieldFixed?.(res.data.field, res.data.value);
        toast.success("Applied — re-analyzing");
        analyze();
      } else toast.error(res.data?.error || "Fix failed");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Fix failed");
    } finally {
      setFixing(null);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium flex items-center gap-1.5"><Gauge className="w-4 h-4 text-primary" /> SEO score</p>
        <Button size="sm" variant="outline" onClick={analyze} disabled={analyzing || !postId} className="gap-1.5 h-8">
          {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Analyze
        </Button>
      </div>

      {!analysis && (
        <p className="text-xs text-muted-foreground">
          {postId ? "Run an analysis to score this post and get a checklist." : "Save the post to enable SEO analysis."}
        </p>
      )}

      {analysis && (
        <>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-sora ${STATUS_COLOR[analysis.status]}`}>{analysis.score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
            <span className={`ml-auto text-xs font-medium uppercase tracking-wide ${STATUS_COLOR[analysis.status]}`}>{analysis.status}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full ${analysis.status === "poor" ? "bg-destructive" : analysis.status === "fair" ? "bg-amber-500" : "bg-green-500"}`}
              style={{ width: `${analysis.score}%` }}
            />
          </div>

          <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {analysis.critical_issues.map((t, i) => (
              <ChecklistRow key={`c${i}`} icon={<XCircle className="w-3.5 h-3.5" />} color="text-destructive" text={t} />
            ))}
            {analysis.warnings.map((t, i) => (
              <ChecklistRow key={`w${i}`} icon={<AlertTriangle className="w-3.5 h-3.5" />} color="text-amber-500" text={t} />
            ))}
            {analysis.passed.map((t, i) => (
              <ChecklistRow key={`p${i}`} icon={<CheckCircle2 className="w-3.5 h-3.5" />} color="text-green-500" text={t} />
            ))}
          </ul>

          <div className="pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" /> Fix with AI</p>
            <div className="flex flex-wrap gap-1.5">
              {FIX_ACTIONS.map((f) => (
                <Button
                  key={f.action}
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs gap-1"
                  disabled={!!fixing}
                  onClick={() => runFix(f)}
                >
                  {fixing === f.action ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}