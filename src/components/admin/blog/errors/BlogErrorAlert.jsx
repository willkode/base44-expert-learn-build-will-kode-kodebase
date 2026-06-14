import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, Pencil, Sparkles, Wand2, CalendarClock, RotateCcw,
  ScrollText, Settings, Search,
} from "lucide-react";

// Maps an action key -> button config. `ctx` provides the post id + handlers.
function actionButton(key, ctx) {
  switch (key) {
    case "edit_post":
      return ctx.postId
        ? { label: "Edit post", icon: Pencil, to: `/admin/marketing/blog/posts/${ctx.postId}/edit` }
        : null;
    case "fix_seo":
      return ctx.onFixSeo ? { label: "Fix SEO issues", icon: Sparkles, onClick: ctx.onFixSeo } : null;
    case "generate_fields":
      return ctx.onGenerateFields ? { label: "Generate missing fields", icon: Wand2, onClick: ctx.onGenerateFields } : null;
    case "reschedule":
      return ctx.onReschedule ? { label: "Reschedule", icon: CalendarClock, onClick: ctx.onReschedule } : null;
    case "retry_publish":
      return ctx.onRetryPublish ? { label: "Retry publishing", icon: RotateCcw, onClick: ctx.onRetryPublish } : null;
    case "view_logs":
      return { label: "View logs", icon: ScrollText, to: "/admin/marketing/blog/logs" };
    case "configure_settings":
      return { label: "Configure settings", icon: Settings, to: "/admin/marketing/blog/settings" };
    case "connect_search_console":
      return { label: "Search Console", icon: Search, to: "/admin/marketing/blog/search-console" };
    default:
      return null;
  }
}

// Friendly, actionable error block. Pass a mapped error from lib/blogErrors.
export default function BlogErrorAlert({ error, ctx = {}, onDismiss, busy }) {
  if (!error) return null;
  const buttons = (error.actions || []).map((k) => actionButton(k, ctx)).filter(Boolean);

  return (
    <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-sora font-semibold text-sm text-foreground">{error.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{error.explanation}</p>
          <p className="text-sm text-foreground/90 mt-2"><span className="font-medium">Next step:</span> {error.nextStep}</p>

          {buttons.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {buttons.map((b, i) =>
                b.to ? (
                  <Button key={i} asChild size="sm" variant={i === 0 ? "default" : "outline"}
                    className={i === 0 ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}>
                    <Link to={b.to}><b.icon className="w-4 h-4 mr-2" />{b.label}</Link>
                  </Button>
                ) : (
                  <Button key={i} size="sm" variant={i === 0 ? "default" : "outline"} onClick={b.onClick} disabled={busy}
                    className={i === 0 ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}>
                    <b.icon className="w-4 h-4 mr-2" />{b.label}
                  </Button>
                )
              )}
            </div>
          )}

          {error.raw && (
            <p className="text-[11px] text-muted-foreground/70 mt-3 font-mono break-words">{error.raw}</p>
          )}
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground text-xs shrink-0">Dismiss</button>
        )}
      </div>
    </div>
  );
}