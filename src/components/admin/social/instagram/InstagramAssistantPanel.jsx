import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IG_AI_ACTIONS } from "./instagramConfig";

const IDEA_ACTIONS = new Set(["generate_image_concept", "generate_reel_idea", "generate_carousel_outline"]);

// AI assistant for Instagram: caption rewrites, hooks, hashtags, alt text, and content ideas.
export default function InstagramAssistantPanel({ ig, campaignId, onApply }) {
  const [busyAction, setBusyAction] = useState(null);
  const [options, setOptions] = useState(null);
  const [idea, setIdea] = useState(null);

  const run = async (action) => {
    setBusyAction(action);
    setOptions(null);
    setIdea(null);
    try {
      const res = await base44.functions.invoke("generateInstagramAssistant", {
        action,
        caption: ig.caption || "",
        media_type: ig.media_type || "image",
        alt_text: ig.alt_text || "",
        campaign_id: campaignId || "",
      });
      if (res?.data?.error) throw new Error(res.data.error);
      const result = res.data.result || {};

      if (action === "generate_hooks") {
        setOptions(result.options || []);
      } else if (IDEA_ACTIONS.has(action)) {
        setIdea(result.notes || "");
      } else {
        const patch = {};
        if (result.caption) patch.caption = result.caption;
        if (Array.isArray(result.hashtags) && result.hashtags.length) patch.hashtags = result.hashtags;
        if (result.first_comment) patch.first_comment = result.first_comment;
        if (result.alt_text) patch.alt_text = result.alt_text;
        onApply(patch);
        toast.success("Instagram assistant applied.");
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
        <h3 className="font-sora font-semibold text-sm">Instagram AI assistant</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {IG_AI_ACTIONS.map((a) => (
          <Button
            key={a.key}
            size="sm"
            variant="outline"
            onClick={() => run(a.key)}
            disabled={busyAction != null}
          >
            {busyAction === a.key ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : IDEA_ACTIONS.has(a.key) ? (
              <Lightbulb className="w-3.5 h-3.5 mr-1" />
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
            <p className="text-xs text-muted-foreground">No hooks returned.</p>
          ) : (
            options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { onApply({ caption: opt }); toast.success("Applied as caption."); }}
                className="w-full text-left rounded-lg border border-border bg-background/40 px-3 py-2 hover:border-primary/50 transition-colors"
              >
                <p className="text-xs text-foreground">{opt}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Click to use as the caption opener</p>
              </button>
            ))
          )}
        </div>
      )}

      {idea && (
        <div className="mt-4 rounded-lg border border-border bg-background/40 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Idea</p>
          <p className="text-xs text-foreground whitespace-pre-wrap">{idea}</p>
        </div>
      )}
    </div>
  );
}