import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FACEBOOK_AI_ACTIONS } from "./facebookConfig";

// AI assistant for Facebook Page posts: rewrites and generators that apply to the message.
export default function FacebookAssistantPanel({ fb, topic, campaignId, onApply }) {
  const [busyAction, setBusyAction] = useState(null);

  const run = async (action) => {
    setBusyAction(action);
    try {
      const res = await base44.functions.invoke("generateFacebookAssistant", {
        action,
        message: fb.message || "",
        topic: topic || "",
        campaign_id: campaignId || "",
      });
      if (res?.data?.error) throw new Error(res.data.error);
      const result = res.data.result || {};
      if (result.message) {
        onApply({ message: result.message });
        toast.success("Facebook assistant applied.");
      } else {
        toast.error("No content returned.");
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
        <h3 className="font-sora font-semibold text-sm">Facebook AI assistant</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {FACEBOOK_AI_ACTIONS.map((a) => (
          <Button
            key={a.key}
            size="sm"
            variant="outline"
            onClick={() => run(a.key)}
            disabled={busyAction != null}
          >
            {busyAction === a.key ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1" />
            )}
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}