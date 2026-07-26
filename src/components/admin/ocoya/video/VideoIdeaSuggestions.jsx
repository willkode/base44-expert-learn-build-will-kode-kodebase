import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export default function VideoIdeaSuggestions({ onGenerateSelected, generating }) {
  const [ideas, setIdeas] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const suggest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("suggestSocialVideoIdeas", {});
      if (res.data?.error) throw new Error(res.data.error);
      setIdeas(res.data.ideas || []);
      setSelected([]);
      trackEvent("social_video_ideas_suggested", { count: (res.data.ideas || []).length });
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Could not suggest video ideas.");
    }
    setLoading(false);
  };

  const toggle = (i) =>
    setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-sora font-semibold">AI video ideas</h3>
          <p className="text-xs text-muted-foreground">
            5 video concepts built around your products and services.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={suggest} disabled={loading}>
          {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
          Suggest 5 videos
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {ideas.length > 0 && (
        <div className="space-y-2">
          {ideas.map((idea, i) => (
            <label
              key={i}
              className="flex cursor-pointer gap-3 rounded-xl border border-border bg-secondary/30 p-3 hover:border-primary/40"
            >
              <Checkbox checked={selected.includes(i)} onCheckedChange={() => toggle(i)} className="mt-0.5" />
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{idea.title}</span>
                  <Badge variant="secondary">{idea.platform}</Badge>
                  <Badge variant="outline">{idea.duration}s</Badge>
                </div>
                {idea.description && <p className="text-xs text-muted-foreground">{idea.description}</p>}
                <p className="text-xs text-foreground/80">“{idea.script}”</p>
              </div>
            </label>
          ))}

          <Button
            className="w-full"
            disabled={selected.length === 0 || generating}
            onClick={() => onGenerateSelected(selected.map((i) => ideas[i]))}
          >
            {generating ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-1.5 h-4 w-4" />
            )}
            Generate {selected.length || ""} selected video{selected.length === 1 ? "" : "s"}
          </Button>
        </div>
      )}
    </div>
  );
}