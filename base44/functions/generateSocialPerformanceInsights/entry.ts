import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALL_PLATFORMS = ["twitter", "reddit", "linkedin", "facebook", "instagram"];

// Engagement rollup for a single analytics row (platform-agnostic).
function rowEngagement(r) {
  return (r.likes || 0) + (r.comments || 0) + (r.shares || 0) + (r.reposts || 0) +
    (r.saves || 0) + (r.upvotes || 0) +
    (r.instagram_likes || 0) + (r.instagram_comments || 0) + (r.instagram_saves || 0) + (r.instagram_shares || 0) +
    (r.facebook_reactions || 0) + (r.facebook_comments || 0) + (r.facebook_shares || 0);
}

function rowImpressions(r) {
  return (r.impressions || 0) + (r.reach || 0) + (r.instagram_impressions || 0) + (r.facebook_impressions || 0);
}

function rowClicks(r) {
  return (r.clicks || 0) + (r.facebook_clicks || 0);
}

function engagementRate(eng, imp) {
  if (!imp) return 0;
  return Math.round((eng / imp) * 10000) / 100; // percent, 2 decimals
}

// Bucket an ISO timestamp into a human posting-time slot in the post timezone (fallback America/Chicago).
function timeSlot(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const day = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/Chicago" });
  const hour = parseInt(d.toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Chicago" }), 10);
  let part = "morning";
  if (hour >= 12 && hour < 17) part = "afternoon";
  else if (hour >= 17 && hour < 21) part = "evening";
  else if (hour >= 21 || hour < 5) part = "night";
  return `${day} ${part}`;
}

function topN(map, n, mapFn) {
  return Object.entries(map)
    .sort((a, b) => b[1].engagement - a[1].engagement)
    .slice(0, n)
    .map(([key, v]) => mapFn(key, v));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { date_range = "30", campaign_id = null, platform = null, save = false } = body || {};

    // 1) Load analytics within the date range.
    const cutoff = date_range === "all" ? null : new Date(Date.now() - parseInt(date_range, 10) * 24 * 60 * 60 * 1000);
    const allAnalytics = await base44.asServiceRole.entities.SocialPostAnalytics.list("-collected_at", 3000);
    const analytics = allAnalytics.filter((a) => {
      if (platform && a.platform !== platform) return false;
      if (campaign_id && a.campaign_id !== campaign_id) return false;
      if (cutoff && a.collected_at && new Date(a.collected_at) < cutoff) return false;
      return true;
    });

    if (analytics.length === 0) {
      return Response.json({
        result: null,
        empty: true,
        message: "No published-post analytics found for the selected filters. Publish posts and let metrics collect, then try again.",
      });
    }

    // 2) Join to ScheduledPost (timing/payload) and SocialPost (content/format/campaign).
    const scheduledIds = [...new Set(analytics.map((a) => a.scheduled_post_id).filter(Boolean))];
    const socialIds = [...new Set(analytics.map((a) => a.social_post_id).filter(Boolean))];
    const campaignIds = [...new Set(analytics.map((a) => a.campaign_id).filter(Boolean))];

    const [scheduledPosts, socialPosts, campaigns] = await Promise.all([
      Promise.all(scheduledIds.map((id) => base44.asServiceRole.entities.ScheduledPost.get(id).catch(() => null))),
      Promise.all(socialIds.map((id) => base44.asServiceRole.entities.SocialPost.get(id).catch(() => null))),
      Promise.all(campaignIds.map((id) => base44.asServiceRole.entities.SocialCampaign.get(id).catch(() => null))),
    ]);

    const schedById = {};
    scheduledPosts.filter(Boolean).forEach((s) => { schedById[s.id] = s; });
    const socialById = {};
    socialPosts.filter(Boolean).forEach((s) => { socialById[s.id] = s; });
    const campaignById = {};
    campaigns.filter(Boolean).forEach((c) => { campaignById[c.id] = c; });

    // Brand profile for AI context.
    const brands = await base44.asServiceRole.entities.BrandProfile.filter({ account_id: "global" }, "-created_date", 1);
    const brand = brands && brands[0] ? brands[0] : null;

    // 3) Build per-post records + aggregates.
    const platformAgg = {};
    const timeAgg = {};
    const formatAgg = {};
    const campaignAgg = {};
    const hashtagAgg = {};
    const scored = [];

    for (const a of analytics) {
      const sched = a.scheduled_post_id ? schedById[a.scheduled_post_id] : null;
      const sp = a.social_post_id ? socialById[a.social_post_id] : null;
      const eng = rowEngagement(a);
      const imp = rowImpressions(a);
      const clk = rowClicks(a);
      const er = engagementRate(eng, imp);

      // Posting time
      const postedAt = a.collected_at || (sched && sched.scheduled_at) || a.created_date;
      const slot = timeSlot(postedAt);

      // Content format
      let format = a.platform;
      if (a.platform === "instagram") format = `instagram_${(sched?.platform_specific_payload?.media_type) || sp?.platform_variants?.instagram_media_type || "image"}`;
      else if (a.platform === "facebook") format = `facebook_${(sched?.platform_specific_payload?.post_type) || sp?.platform_variants?.facebook_post_type || "text"}`;
      else if (a.platform === "twitter") format = (sched?.platform_specific_payload?.thread || []).length > 0 ? "twitter_thread" : "twitter_single";
      else if (a.platform === "reddit") format = `reddit_${(sched?.platform_specific_payload?.reddit_post_kind) || "self"}`;
      else if (a.platform === "linkedin") format = "linkedin_post";

      const bump = (agg, key) => {
        if (!key) return;
        if (!agg[key]) agg[key] = { posts: 0, engagement: 0, impressions: 0, clicks: 0 };
        agg[key].posts += 1;
        agg[key].engagement += eng;
        agg[key].impressions += imp;
        agg[key].clicks += clk;
      };

      bump(platformAgg, a.platform);
      bump(timeAgg, slot);
      bump(formatAgg, format);
      bump(campaignAgg, a.campaign_id);

      // Hashtags from the source post
      const tags = (sp?.hashtags || sp?.platform_variants?.instagram_hashtags || []);
      for (const t of tags) {
        const key = String(t).replace(/^#/, "").toLowerCase();
        if (!key) continue;
        if (!hashtagAgg[key]) hashtagAgg[key] = { posts: 0, engagement: 0 };
        hashtagAgg[key].posts += 1;
        hashtagAgg[key].engagement += eng;
      }

      scored.push({
        platform: a.platform,
        title: sp?.title_internal || "",
        excerpt: (sp?.content || sched?.platform_specific_payload?.text || sched?.platform_specific_payload?.message || sched?.platform_specific_payload?.caption || sched?.platform_specific_payload?.body || "").slice(0, 200),
        cta: sp?.platform_variants?.facebook_cta || "",
        format,
        time_slot: slot,
        url: a.platform_post_url || "",
        campaign: a.campaign_id ? (campaignById[a.campaign_id]?.name || "") : "",
        engagement: eng,
        impressions: imp,
        clicks: clk,
        engagement_rate: er,
      });
    }

    scored.sort((x, y) => y.engagement_rate - x.engagement_rate || y.engagement - x.engagement);
    const bestPosts = scored.slice(0, 5);
    const worstPosts = scored.slice(-5).reverse();

    const aggregates = {
      best_platforms: topN(platformAgg, 5, (k, v) => ({ platform: k, ...v, engagement_rate: engagementRate(v.engagement, v.impressions) })),
      best_times: topN(timeAgg, 6, (k, v) => ({ time_slot: k, ...v, engagement_rate: engagementRate(v.engagement, v.impressions) })),
      best_formats: topN(formatAgg, 6, (k, v) => ({ format: k, ...v, engagement_rate: engagementRate(v.engagement, v.impressions) })),
      campaigns: Object.entries(campaignAgg).map(([k, v]) => ({
        campaign: campaignById[k]?.name || k,
        ...v,
        engagement_rate: engagementRate(v.engagement, v.impressions),
      })).sort((a, b) => a.engagement_rate - b.engagement_rate),
      top_hashtags: Object.entries(hashtagAgg)
        .sort((a, b) => b[1].engagement - a[1].engagement)
        .slice(0, 12)
        .map(([k, v]) => ({ hashtag: `#${k}`, posts: v.posts, engagement: v.engagement })),
    };

    // 4) Build the AI prompt with the aggregated context.
    const brandContext = brand
      ? `BRAND: ${brand.brand_name || "—"} | Audience: ${brand.audience || "—"} | Value props: ${(brand.value_propositions || []).join("; ") || "—"} | Default CTA: ${brand.default_call_to_action || "—"}`
      : "BRAND: (not set — infer a credible developer/SaaS tool tone.)";

    const responseSchema = {
      type: "object",
      properties: {
        summary: { type: "string" },
        top_findings: { type: "array", items: { type: "string" } },
        recommended_actions: { type: "array", items: { type: "string" } },
        content_ideas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              topic: { type: "string" },
              angle: { type: "string" },
              suggested_platforms: { type: "array", items: { type: "string" } },
              rationale: { type: "string" },
            },
          },
        },
        platform_recommendations: {
          type: "object",
          properties: {
            twitter: { type: "array", items: { type: "string" } },
            reddit: { type: "array", items: { type: "string" } },
            linkedin: { type: "array", items: { type: "string" } },
            facebook: { type: "array", items: { type: "string" } },
            instagram: { type: "array", items: { type: "string" } },
          },
        },
        posting_time_recommendations: { type: "array", items: { type: "string" } },
        hashtag_recommendations: { type: "array", items: { type: "string" } },
        campaign_recommendations: { type: "array", items: { type: "string" } },
        facebook_recommendations: { type: "array", items: { type: "string" } },
        instagram_recommendations: { type: "array", items: { type: "string" } },
        best_call_to_action: { type: "string" },
      },
    };

    const prompt = `You are a senior social media performance analyst for a developer/SaaS brand. Analyze the aggregated data below from already-published posts and produce concrete, data-grounded insights. Only base conclusions on the data provided — never invent numbers.

${brandContext}

ANALYSIS SCOPE:
- Date range: ${date_range === "all" ? "all time" : `last ${date_range} days`}
- Platform filter: ${platform || "all platforms"}
- Campaign filter: ${campaign_id ? (campaignById[campaign_id]?.name || campaign_id) : "all campaigns"}
- Total posts analyzed: ${analytics.length}

BEST POSTS (highest engagement rate):
${JSON.stringify(bestPosts, null, 1)}

WORST POSTS (lowest engagement rate):
${JSON.stringify(worstPosts, null, 1)}

PLATFORM PERFORMANCE:
${JSON.stringify(aggregates.best_platforms, null, 1)}

POSTING-TIME PERFORMANCE:
${JSON.stringify(aggregates.best_times, null, 1)}

CONTENT-FORMAT PERFORMANCE:
${JSON.stringify(aggregates.best_formats, null, 1)}

CAMPAIGN PERFORMANCE (weakest first):
${JSON.stringify(aggregates.campaigns, null, 1)}

TOP HASHTAGS BY ENGAGEMENT:
${JSON.stringify(aggregates.top_hashtags, null, 1)}

PRODUCE:
- summary: 2-4 sentences on what the data shows overall (what worked, what did not).
- top_findings: 4-8 sharp bullet findings (best/worst platform, best content type, best posting time, best CTA, best hashtags, weak campaigns).
- recommended_actions: 4-8 concrete next actions.
- content_ideas: 3-6 specific post ideas modeled on what performed well (topic, angle, suggested_platforms, rationale).
- platform_recommendations: per-platform tactical advice for twitter, reddit, linkedin, facebook, instagram (only fill platforms that have data; leave others empty arrays).
- posting_time_recommendations: best day/time windows to post.
- hashtag_recommendations: hashtags or hashtag strategies to lean into.
- campaign_recommendations: improvements for weak campaigns.
- facebook_recommendations: Facebook Page-specific advice (post type mix, link vs photo vs video, CTA usage, avoiding engagement bait).
- instagram_recommendations: Instagram-specific advice (caption hooks, media type mix image/carousel/Reel, alt text, hashtag count, first comment).
- best_call_to_action: the single CTA pattern that appears to drive the most clicks/engagement.

Keep every recommendation specific, actionable, and tied to the data. Be honest when a platform or campaign underperforms.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "gpt_5_5",
      response_json_schema: responseSchema,
    });

    // Normalize platform_recommendations to always contain all 5 keys.
    const pr = result.platform_recommendations || {};
    result.platform_recommendations = ALL_PLATFORMS.reduce((acc, p) => {
      acc[p] = Array.isArray(pr[p]) ? pr[p] : [];
      return acc;
    }, {});

    const metricsSnapshot = {
      best_posts: bestPosts,
      worst_posts: worstPosts,
      ...aggregates,
    };

    // 5) Optionally save the insight summary.
    let saved = null;
    if (save) {
      saved = await base44.asServiceRole.entities.SocialInsight.create({
        account_id: "global",
        user_id: user.id,
        title: `Insights — ${date_range === "all" ? "All time" : `Last ${date_range}d`}${platform ? ` · ${platform}` : ""}${campaign_id ? ` · ${campaignById[campaign_id]?.name || "campaign"}` : ""}`,
        date_range: String(date_range),
        campaign_id: campaign_id || undefined,
        platform_filter: platform || undefined,
        posts_analyzed: analytics.length,
        summary: result.summary || "",
        top_findings: result.top_findings || [],
        recommended_actions: result.recommended_actions || [],
        content_ideas: result.content_ideas || [],
        platform_recommendations: result.platform_recommendations || {},
        posting_time_recommendations: result.posting_time_recommendations || [],
        hashtag_recommendations: result.hashtag_recommendations || [],
        campaign_recommendations: result.campaign_recommendations || [],
        facebook_recommendations: result.facebook_recommendations || [],
        instagram_recommendations: result.instagram_recommendations || [],
        metrics_snapshot: metricsSnapshot,
        ai_model_used: "gpt_5_5",
        created_by: user.email,
      });
    }

    // Best-effort log.
    try {
      await base44.asServiceRole.entities.SocialAutomationLog.create({
        account_id: "global",
        user_id: user.id,
        event_type: "performance_insights_generated",
        status: "success",
        related_campaign_id: campaign_id || undefined,
        message: `Generated performance insights over ${analytics.length} posts (${date_range === "all" ? "all time" : `${date_range}d`}).`,
        metadata: { date_range: String(date_range), platform: platform || "all", saved: !!save, posts_analyzed: analytics.length },
      });
    } catch (_e) { /* best effort */ }

    return Response.json({ result, metrics: metricsSnapshot, posts_analyzed: analytics.length, saved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});