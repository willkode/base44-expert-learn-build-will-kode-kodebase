import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Sparkles, Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REDDIT_AI_ACTIONS } from "./redditConfig";

// AI assistant for Reddit: reframes content and suggests subreddit targeting.
export default function RedditAssistantPanel({ reddit, topic, campaignId, onApply }) {
  const [busyAction, setBusyAction] = useState(null);
  const [suggestions, setSuggestions] = useState(null);

  const run = async (action) => {
    setBusyAction(action);
    setSuggestions(null);
    try {
      const res = await base44.functions.invoke("generateRedditAssistant", {
        action,
        title: reddit.title || "",
        post_body: reddit.body || "",
        subreddit: reddit.subreddit || "",
        topic: topic || "",
        campaign_id: campaignId || "",
      });
      if (res?.data?.error) throw new Error(res.data.error);
      const result = res.data.result || {};

      if (action === "suggest_subreddits") {
        setSuggestions(result.subreddit_suggestions || []);
      } else {
        const patch = {};
        if (result.title) patch.title = result.title;
        if (result.body != null) patch.body = result.body;
        if (result.suggested_comment) patch.suggested_comment = result.suggested_comment;
        if (result.promotion_disclosure) patch.promotion_disclosure = result.promotion_disclosure;
        if (result.subreddit_rules_notes) patch.subreddit_rules_notes = result.subreddit_rules_notes;
        onApply(patch);
        toast.success("Reddit assistant applied.");
      }
    } catch (e) {
      toast.error(e.message || "Assistant failed.");
    }
    setBusyAction(null);
  };

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-sora font-semibold text-sm">Reddit AI assistant</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {REDDIT_AI_ACTIONS.map((a) => (
          <Button
            key={a.key}
            size="sm"
            variant="outline"
            onClick={() => run(a.key)}
            disabled={busyAction != null}
          >
            {busyAction === a.key ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : a.key === "suggest_subreddits" ? (
              <Target className="w-3.5 h-3.5 mr-1" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1" />
            )}
            {a.label}
          </Button>
        ))}
      </div>

      {suggestions && (
        <div className="mt-4 space-y-2">
          {suggestions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No subreddit suggestions returned.</p>
          ) : (
            suggestions.map((s, i) => (
              <div key={i} className="rounded-lg border border-border bg-background/40 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onApply({ subreddit: s.subreddit, subreddit_rules_notes: s.rules_notes || "" })}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    r/{s.subreddit}
                  </button>
                  {s.self_promo_allowed && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">
                      self-promo: {s.self_promo_allowed}
                    </span>
                  )}
                </div>
                {s.why && <p className="text-xs text-muted-foreground mt-1">{s.why}</p>}
                {s.rules_notes && <p className="text-[11px] text-amber-400 mt-1">Rules: {s.rules_notes}</p>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}