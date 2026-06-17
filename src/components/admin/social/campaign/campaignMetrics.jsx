// Pure helpers to derive campaign dashboard metrics from posts/jobs/analytics arrays.

export function engagementOf(a) {
  return (a.likes || 0) + (a.comments || 0) + (a.shares || 0) + (a.reposts || 0) + (a.saves || 0) + (a.upvotes || 0);
}

export function summarizeAnalytics(rows) {
  return rows.reduce(
    (acc, r) => {
      acc.impressions += r.impressions || 0;
      acc.reach += r.reach || 0;
      acc.clicks += r.clicks || 0;
      acc.engagement += engagementOf(r);
      return acc;
    },
    { impressions: 0, reach: 0, clicks: 0, engagement: 0 }
  );
}

export function platformBreakdown(rows, platforms) {
  return platforms
    .map((p) => {
      const pr = rows.filter((r) => r.platform === p.key);
      return {
        ...p,
        posts: pr.length,
        impressions: pr.reduce((a, r) => a + (r.impressions || 0), 0),
        engagement: pr.reduce((a, r) => a + engagementOf(r), 0),
      };
    })
    .filter((p) => p.posts > 0);
}

// Facebook-specific aggregate (uses facebook_* fields when present).
export function facebookPerformance(rows) {
  const fb = rows.filter((r) => r.platform === "facebook");
  return {
    posts: fb.length,
    impressions: fb.reduce((a, r) => a + (r.facebook_impressions || r.impressions || 0), 0),
    reach: fb.reduce((a, r) => a + (r.facebook_reach || r.reach || 0), 0),
    reactions: fb.reduce((a, r) => a + (r.facebook_reactions || r.likes || 0), 0),
    comments: fb.reduce((a, r) => a + (r.facebook_comments || r.comments || 0), 0),
    shares: fb.reduce((a, r) => a + (r.facebook_shares || r.shares || 0), 0),
    clicks: fb.reduce((a, r) => a + (r.facebook_clicks || r.clicks || 0), 0),
  };
}

// Instagram-specific aggregate.
export function instagramPerformance(rows) {
  const ig = rows.filter((r) => r.platform === "instagram");
  return {
    posts: ig.length,
    reach: ig.reduce((a, r) => a + (r.instagram_reach || r.reach || 0), 0),
    impressions: ig.reduce((a, r) => a + (r.instagram_impressions || r.impressions || 0), 0),
    likes: ig.reduce((a, r) => a + (r.instagram_likes || r.likes || 0), 0),
    comments: ig.reduce((a, r) => a + (r.instagram_comments || r.comments || 0), 0),
    saves: ig.reduce((a, r) => a + (r.instagram_saves || r.saves || 0), 0),
    plays: ig.reduce((a, r) => a + (r.instagram_plays || r.instagram_reel_plays || 0), 0),
  };
}