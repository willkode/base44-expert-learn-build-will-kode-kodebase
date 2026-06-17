import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Sparkles, Loader2, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TWITTER_AI_ACTIONS } from "./twitterConfig";

const OPTION_ACTIONS = new Set(["generate_hooks", "generate_variations"]);

// AI assistant for X/Twitter: rewrites, threads, hooks, and variations.
export default function TwitterAssistantPanel({ tw, campaignId, onApply }) {
  const [busyAction, setBusyAction] = useState(null);
  const [options, setOptions] = useState(null);

  const run = async (action) => {
    setBusyAction(action);
    setOptions(null);
    try {
      const res = await base44.functions.invoke("generateTwitterAssistant", {
        action,
        text: tw.text || "",
        thread: tw.thread || [],
        campaign_id: campaignId || "",
      });
      if (res?.data?.error) throw new Error(res.data.error);
      const result = res.data.result || {};

      if (OPTION_ACTIONS.has(action)) {
        setOptions(result.options || []);
      } else {
        const patch = {};
        if (result.text) patch.text = result.text;
        if (Array.isArray(result.thread)) patch.thread = result.thread.filter((t) => (t || "").trim());
        onApply(patch);
        toast.success("X assistant applied.");
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
        <h3 className="font-sora font-semibold text-sm">X / Twitter AI assistant</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {TWITTER_AI_ACTIONS.map((a) => (
          <Button
            key={a.key}
            size="sm"
            variant="outline"
            onClick={() => run(a.key)}
            disabled={busyAction != null}
          >
            {busyAction === a.key ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : a.key === "turn_into_thread" || a.key === "linkedin_to_thread" ? (
              <ListOrdered className="w-3.5 h-3.5 mr-1" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1" />
            )}
            {a.label}
          </Button>
        ))}
      </div>

      {options && (
        <div className="mt-4 space-y-2">
          {options.length === 0 ? (
            <p className="text-xs text-muted-foreground">No options returned.</p>
          ) : (
            options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { onApply({ text: opt }); toast.success("Applied as primary tweet."); }}
                className="w-full text-left rounded-lg border border-border bg-background/40 px-3 py-2 hover:border-primary/50 transition-colors"
              >
                <p className="text-xs text-foreground">{opt}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Click to use as the primary tweet</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}