import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALL_PLATFORMS = ["twitter", "reddit", "linkedin", "facebook", "instagram"];

// Default per-platform block.
function platformDefault(extra = {}) {
  return {
    enabled: true,
    postingEnabled: true,
    analyticsEnabled: true,
    imagePostingEnabled: true,
    maxPostsPerDay: 5,
    maxPostsPerHour: 2,
    ...extra,
  };
}

// Documented OAuth scopes / rate-limit notes per platform (display only).
const PLATFORM_META = {
  twitter: {
    requiredScopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    rateLimitNotes: "X API: posting limits depend on access tier (Free/Basic/Pro). Avoid bursts.",
  },
  reddit: {
    requiredScopes: ["identity", "submit", "read"],
    rateLimitNotes: "Reddit: ~1 post per 10 min per subreddit recommended; respect subreddit rules.",
  },
  linkedin: {
    requiredScopes: ["openid", "profile", "email", "w_member_social"],
    rateLimitNotes: "LinkedIn: ~150 posts/day per member app limit; keep cadence conservative.",
  },
  facebook: {
    requiredScopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list", "business_management"],
    rateLimitNotes: "Meta Graph: per-app rate limits; Page posting requires approved permissions.",
  },
  instagram: {
    requiredScopes: ["instagram_basic", "instagram_content_publish", "pages_show_list", "business_management"],
    rateLimitNotes: "Instagram Graph: 25 API-published posts per 24h per account.",
  },
};

function defaults() {
  const platforms = {};
  for (const p of ALL_PLATFORMS) platforms[p] = platformDefault();
  return {
    key: "global",
    systemEnabled: true,
    defaultTimezone: "America/Chicago",
    defaultApprovalRequired: true,
    defaultPostingFrequencyLimit: 5,
    enableAiGeneration: true,
    enableImageGeneration: true,
    enableAutoPosting: true,
    enableAnalyticsSync: true,
    platforms,
    facebook: {
      enabled: true,
      postingEnabled: true,
      analyticsEnabled: true,
      imagePostingEnabled: true,
      videoPostingEnabled: true,
      maxPostsPerDay: 5,
      maxPostsPerHour: 2,
      requireApprovalBeforePublishing: true,
      blockWithoutPagePermission: true,
      blockPersonalProfilePosting: true,
    },
    instagram: {
      enabled: true,
      postingEnabled: true,
      analyticsEnabled: true,
      imagePostingEnabled: true,
      videoReelPostingEnabled: true,
      carouselPostingEnabled: true,
      storyPostingEnabled: true,
      maxPostsPerDay: 5,
      maxPostsPerHour: 2,
      requireApprovalBeforePublishing: true,
      blockTextOnlyPosts: true,
      requireMediaAltText: true,
    },
    ai: {
      defaultTone: "professional",
      defaultVariants: 3,
      contentQualityRules: "Be factual, avoid hype, no invented stats or testimonials, match brand voice.",
      defaultHashtagCount: 5,
      requireApprovalBeforeScheduling: true,
      requireApprovalBeforePublishing: true,
      defaultImageStyle: "Dark tech aesthetic, deep navy background, orange-to-red gradient accents, minimal flat vector, blueprint grid, soft glows.",
    },
    safety: {
      blockAutoPostingWithoutApproval: true,
      blockDuplicatePosts: true,
      blockMissingLandingPageWhenRequired: true,
      blockRedditPromotionalUnlessConfirmed: true,
      blockFacebookEngagementBaitUnlessConfirmed: true,
      blockInstagramTextOnly: true,
      blockPostingWhenTokenExpired: true,
      pauseCampaignAfterRepeatedFailures: true,
      notifyAfterFailedPublishing: true,
    },
    notifications: {
      notifyOnPublish: true,
      notifyOnFailure: true,
      notifyOnTokenExpiry: true,
      notifyOnApprovalNeeded: true,
      notifyWeeklyAnalyticsSummary: false,
      notifyOnMetaConnectionAttention: true,
    },
    limits: {
      maxCampaigns: 25,
      maxGeneratedPostsPerDay: 50,
      maxScheduledPosts: 500,
      maxConnectedAccounts: 10,
      maxAiImagesPerMonth: 200,
      maxFacebookPages: 5,
      maxInstagramAccounts: 5,
      maxInstagramMediaPostsPerDay: 25,
    },
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const existing = await base44.asServiceRole.entities.SocialSettings.filter({ key: 'global' }, '-created_date', 1);
    let settings = existing && existing[0] ? existing[0] : null;

    if (!settings) {
      settings = await base44.asServiceRole.entities.SocialSettings.create(defaults());
    }

    // Merge defaults so newly-added fields are always present, plus live OAuth/connection status.
    const def = defaults();
    const merged = {
      ...def,
      ...settings,
      platforms: { ...def.platforms, ...(settings.platforms || {}) },
      facebook: { ...def.facebook, ...(settings.facebook || {}) },
      instagram: { ...def.instagram, ...(settings.instagram || {}) },
      ai: { ...def.ai, ...(settings.ai || {}) },
      safety: { ...def.safety, ...(settings.safety || {}) },
      notifications: { ...def.notifications, ...(settings.notifications || {}) },
      limits: { ...def.limits, ...(settings.limits || {}) },
    };
    for (const p of ALL_PLATFORMS) {
      merged.platforms[p] = { ...platformDefault(), ...(merged.platforms[p] || {}) };
    }

    // Live connection status (OAuth configured) per platform from SocialAccount.
    const accounts = await base44.asServiceRole.entities.SocialAccount.list('-created_date', 200);
    const connection = {};
    let metaAppReviewStatus = null;
    for (const p of ALL_PLATFORMS) connection[p] = { configured: false, status: 'disconnected' };
    for (const a of accounts) {
      if (!ALL_PLATFORMS.includes(a.platform)) continue;
      if (a.connection_status === 'connected') {
        connection[a.platform] = { configured: true, status: 'connected' };
      } else if (!connection[a.platform].configured) {
        connection[a.platform] = { configured: false, status: a.connection_status || 'disconnected' };
      }
      if ((a.platform === 'facebook' || a.platform === 'instagram') && a.meta_app_review_status) {
        metaAppReviewStatus = a.meta_app_review_status;
      }
    }

    return Response.json({
      success: true,
      settings: merged,
      meta: { platformMeta: PLATFORM_META, connection, metaAppReviewStatus },
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});