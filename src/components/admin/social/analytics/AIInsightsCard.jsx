import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  Sparkles, Loader2, TrendingUp, ListChecks, Lightbulb, Clock, Hash,
  Megaphone, Facebook, Instagram, Quote, PlusCircle, FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORM_MAP } from "@/components/admin/social/socialConfig";
import InsightSection from "./InsightSection";
import { trackEvent } from "@/lib/analytics";

export default function AIInsightsCard({ range, platform, campaign, campaigns }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [busyIdea, setBusyIdea] = useState(null);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [insight, setInsight] = useState(null);
  const [postsAnalyzed, setPostsAnalyzed] = useState(0);
  const [error, setError] = useState("");

  const generate = async ({ save = false } = {}) => {
    setLoading(true);
    setError("");
    trackEvent("admin_social_insights_generate", { range, platform, save });
    try {
      const { data } = await base44.functions.invoke("generateSocialPerformanceInsights", {
        date_range: range,
        platform: platform === "all" ? null : platform,
        campaign_id: campaign === "all" ? null : campaign,
        save,
      });
      if (data?.error) { setError(data.error); return; }
      if (data?.empty) { setInsight(null); setError(data.message || "No analytics data for these filters yet."); return; }
      setInsight(data.result);
      setPostsAnalyzed(data.posts_analyzed || 0);
      if (save) toast.success("Insight saved.");
    } catch (e) {
      setError(e.message || "Could not generate insights.");
    } finally {
      setLoading(false);
    }
  };

  const createPostFromIdea = async (idea, idx) => {
    setBusyIdea(idx);
    trackEvent("admin_social_insights_create_post");
    try {
      const platforms = (idea.suggested_platforms || []).filter((p) => PLATFORM_MAP[p]);
      const targets = platforms.length ? platforms : (platform !== "all" ? [platform] : ["linkedin"]);
      let firstId = null;
      for (const p of targets) {
        const rec = await base44.entities.SocialPost.create({
          account_id: "global",
          campaign_id: campaign !== "all" ? campaign : undefined,
          title_internal: idea.topic?.slice(0, 80) || "Insight idea",
          content: `${idea.angle || idea.topic || ""}`.trim(),
          selected_platforms: [p],
          approval_status: "draft",
          publishing_status: "unscheduled",
          ai_generation_input: idea.topic || "",
        });
        if (!firstId) firstId = rec.id;
      }
      toast.success("Draft post created from insight. Open the Studio to refine it.");
    } catch (e) {
      toast.error(e.message || "Could not create post.");
    } finally {
      setBusyIdea(null);
    }
  };

  const createCampaignFromInsight = async () => {
    if (!insight) return;
    setCreatingCampaign(true);
    trackEvent("admin_social_insights_create_campaign");
    try {
      const themes = (insight.content_ideas || []).map((i) => i.topic).filter(Boolean).slice(0, 6);
      const created = await base44.entities.SocialCampaign.create({
        account_id: "global",
        name: `Insight Campaign — ${new Date().toLocaleDateString()}`,
        description: insight.summary || "Campaign generated from AI performance insights.",
        goal: "engagement",
        key_message: (insight.top_findings || [])[0] || "",
        content_themes: themes,
        default_hashtag_strategy: (insight.hashtag_recommendations || []).join(", "),
        status: "draft",
        approval_required: true,
      });
      toast.success("Campaign drafted from insight.");
      navigate(`/admin/marketing/social/campaigns/${created.id}`);
    } catch (e) {
      toast.error(e.message || "Could not create campaign.");
    } finally {
      setCreatingCampaign(false);
    }
  };

  return (
    <section className="rounded-2xl border border-primary/30 bg-card/60 p-5 glow-orange">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="font-sora font-semibold">AI Performance Insights</h2>
            <p className="text-sm text-muted-foreground">Analyze published posts and get content, timing, platform, and campaign recommendations.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => generate({ save: false })} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
            {insight ? "Regenerate" : "Generate Insights"}
          </Button>
          {insight && (
            <Button variant="outline" onClick={() => generate({ save: true })} disabled={loading}>
              Save insight
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-border bg-background/40 px-4 py-3 text-sm text-muted-foreground">{error}</div>
      )}

      {!insight && !error && !loading && (
        <p className="text-sm text-muted-foreground">Click <span className="text-foreground font-medium">Generate Insights</span> to analyze the currently filtered date range, platform, and campaign.</p>
      )}

      {loading && !insight && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Analyzing performance across your published posts…
        </div>
      )}

      {insight && (
        <div className="space-y-4">
          {insight.summary && (
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <p className="text-sm leading-relaxed">{insight.summary}</p>
              {postsAnalyzed > 0 && <p className="text-xs text-muted-foreground mt-2">Based on {postsAnalyzed} published post{postsAnalyzed === 1 ? "" : "s"}.</p>}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InsightSection icon={TrendingUp} title="Top findings" items={insight.top_findings} />
            <InsightSection icon={ListChecks} title="Recommended actions" items={insight.recommended_actions} />
            <InsightSection icon={Clock} title="Best posting times" items={insight.posting_time_recommendations} />
            <InsightSection icon={Hash} title="Hashtag recommendations" items={insight.hashtag_recommendations} />
            <InsightSection icon={Megaphone} title="Campaign improvements" items={insight.campaign_recommendations} />
            <InsightSection icon={Facebook} title="Facebook Page recommendations" items={insight.facebook_recommendations} />
            <InsightSection icon={Instagram} title="Instagram recommendations" items={insight.instagram_recommendations} />
            {insight.best_call_to_action && (
              <InsightSection icon={Quote} title="Best call to action" items={[insight.best_call_to_action]} />
            )}
          </div>

          {/* Platform-specific recommendations */}
          {insight.platform_recommendations && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(insight.platform_recommendations)
                .filter(([, items]) => items && items.length)
                .map(([p, items]) => {
                  const meta = PLATFORM_MAP[p];
                  return <InsightSection key={p} icon={meta?.icon} title={`${meta?.label || p} tips`} items={items} />;
                })}
            </div>
          )}

          {/* Content ideas with create-post action */}
          {insight.content_ideas && insight.content_ideas.length > 0 && (
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h4 className="font-sora font-semibold text-sm">Recommended next posts</h4>
              </div>
              <div className="space-y-2.5">
                {insight.content_ideas.map((idea, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 rounded-lg border border-border bg-card/50 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{idea.topic}</p>
                      {idea.angle && <p className="text-sm text-muted-foreground mt-0.5">{idea.angle}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(idea.suggested_platforms || []).map((p) => {
                          const meta = PLATFORM_MAP[p];
                          if (!meta) return null;
                          const Icon = meta.icon;
                          return (
                            <span key={p} className="inline-flex items-center gap-1 text-xs text-muted-foreground border border-border rounded-md px-1.5 py-0.5">
                              <Icon className="w-3 h-3" /> {meta.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0" onClick={() => createPostFromIdea(idea, i)} disabled={busyIdea === i}>
                      {busyIdea === i ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5 mr-1.5" />}
                      Create post
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="outline" onClick={createCampaignFromInsight} disabled={creatingCampaign}>
              {creatingCampaign ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <FolderPlus className="w-4 h-4 mr-1.5" />}
              Generate campaign from this insight
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}