// Static config for the Social Media production-readiness setup guide.
// Pure data — no business logic — so the guide stays declarative and easy to scan.

// First-run checklist. `key` maps to a flag computed in SocialSetupGuide from
// the records the dashboard already loads (accounts, posts, campaigns, etc.).
export const FIRST_RUN_STEPS = [
  { key: "brandProfile", label: "Complete your Brand Profile", to: "/admin/marketing/social/brand", hint: "Add brand voice, audience, and value props so AI content stays on-brand." },
  { key: "anyPlatform", label: "Connect at least one platform", to: "/admin/marketing/social/connections", hint: "Connect X, Reddit, LinkedIn, Facebook, or Instagram to publish." },
  { key: "facebookPage", label: "Connect a Facebook Page (if using Facebook)", to: "/admin/marketing/social/connections", hint: "Facebook publishing posts to a Page you manage — not a personal profile." },
  { key: "instagramAccount", label: "Connect an Instagram professional account (if using Instagram)", to: "/admin/marketing/social/connections", hint: "Instagram requires a Business or Creator account linked to a Facebook Page." },
  { key: "hasCampaign", label: "Create your first campaign", to: "/admin/marketing/social/campaigns", hint: "Campaigns give AI the goal, audience, and key message to work from." },
  { key: "hasPost", label: "Generate your first post", to: "/admin/marketing/social/studio", hint: "Use the Content Studio to draft platform-specific variants and an image." },
  { key: "hasApprovedPost", label: "Approve a post", to: "/admin/marketing/social/approvals", hint: "Move a post through review → approved. Only approved posts can be scheduled." },
  { key: "hasScheduledPost", label: "Schedule your first post", to: "/admin/marketing/social/calendar", hint: "Pick a future time on the Calendar; the auto-poster handles publishing." },
  { key: "hasAnalytics", label: "Review analytics after publishing", to: "/admin/marketing/social/analytics", hint: "Engagement metrics sync automatically once posts go live." },
];

// Step-by-step connection + workflow reference shown in the guide.
export const HOW_TO_STEPS = [
  { title: "Connect X / Twitter", body: "On Connections, connect X and approve tweet read/write + offline access so we can post and refresh the token." },
  { title: "Connect Reddit", body: "Connect Reddit with identity, submit, and read scopes. You publish to subreddits you choose per post." },
  { title: "Connect LinkedIn", body: "Connect LinkedIn with member social + profile scopes to post as your profile (or an organization you manage)." },
  { title: "Connect a Facebook Page", body: "Log in with Meta, then pick the Facebook Page you manage. Publishing always targets a Page, never a personal profile." },
  { title: "Connect an Instagram professional account", body: "Link an Instagram Business or Creator account to your Facebook Page. Instagram needs media — text-only posts aren't allowed." },
  { title: "Create your Brand Profile", body: "Fill in brand voice, audience, value props, and banned/preferred words to keep AI output consistent." },
  { title: "Create your first campaign", body: "Set the goal, audience, and key message. Campaign context threads into every generated post." },
  { title: "Generate your first post", body: "In the Content Studio, generate platform variants and an on-brand image, then edit anything you like." },
  { title: "Schedule your first post", body: "Approve the post, then schedule it on the Calendar. The auto-poster publishes it at the chosen time." },
  { title: "Review analytics", body: "After posts publish, engagement metrics sync on a schedule and appear in Analytics and the dashboard." },
];

// Admin-only environment / connection checklist.
// Grouped by platform. `key` maps to flags computed in SocialSetupGuide from secrets/accounts.
export const SECRETS_CHECKLIST = [
  {
    key: "aiProvider",
    label: "AI provider (content generation)",
    detail: "Handled by the built-in AI integration — no key required.",
    required: true, managed: true,
  },
  {
    key: "imageProvider",
    label: "Image generation provider",
    detail: "Handled by the built-in image integration — no key required.",
    required: true, managed: true,
  },
  {
    key: "appPublicUrl",
    label: "APP_PUBLIC_URL",
    detail: "Your live domain. Used to build OAuth redirect URLs and links. Set it in app secrets.",
    required: true, managed: false,
  },
  {
    key: "twitter",
    label: "X / Twitter app credentials",
    detail: "Client ID, Client Secret, and Redirect URL from the X Developer Portal (OAuth 2.0).",
    required: false, managed: false,
  },
  {
    key: "reddit",
    label: "Reddit app credentials",
    detail: "Client ID, Client Secret, and Redirect URL from Reddit's app preferences (type: web app).",
    required: false, managed: false,
  },
  {
    key: "linkedin",
    label: "LinkedIn app credentials",
    detail: "Client ID, Client Secret, and Redirect URL from the LinkedIn Developer Portal.",
    required: false, managed: false,
  },
  {
    key: "meta",
    label: "Meta App ID & App Secret",
    detail: "From developers.facebook.com. Powers both Facebook Page and Instagram publishing.",
    required: false, managed: false,
  },
  {
    key: "metaRedirect",
    label: "Meta OAuth Redirect URL",
    detail: "Add your redirect URL to the Meta app's Facebook/Business Login settings.",
    required: false, managed: false,
  },
  {
    key: "metaPermissions",
    label: "Facebook Page & Instagram permissions",
    detail: "Request pages_manage_posts, pages_read_engagement, instagram_basic, instagram_content_publish.",
    required: false, managed: false,
  },
  {
    key: "metaReview",
    label: "Meta App Review status",
    detail: "Advanced Access via App Review is required before publishing for accounts you don't own.",
    required: false, managed: false,
  },
  {
    key: "legal",
    label: "Privacy Policy & Terms URLs",
    detail: "Public Privacy Policy and Terms URLs are required by Meta, X, and LinkedIn app review.",
    required: false, managed: false,
  },
  {
    key: "dataDeletion",
    label: "Data deletion callback URL",
    detail: "Meta requires a data deletion request callback (or instructions URL) for published apps.",
    required: false, managed: false,
  },
  {
    key: "webhook",
    label: "Webhook callback URL (if used)",
    detail: "Only needed if you subscribe to platform webhooks for real-time events.",
    required: false, managed: false,
  },
  {
    key: "testAccounts",
    label: "Test Page & Instagram account",
    detail: "Keep a Facebook Page test account and an Instagram professional test account for verifying publishing.",
    required: false, managed: false,
  },
];

export const SAFETY_WARNINGS = [
  "Auto-posting requires the correct platform permissions — connect and approve every scope before enabling it.",
  "Reddit communities may remove promotional content. Keep posts authentic and discussion-first, and follow each subreddit's rules.",
  "Facebook posting requires Page permissions on a Page you manage.",
  "Facebook personal profile posting is not supported — publishing always targets a Page.",
  "Instagram publishing requires an Instagram Business or Creator (professional) account.",
  "Instagram text-only posts are not supported — every Instagram post needs an image, video, or Reel.",
  "Instagram media publishing depends on Meta permissions and media requirements (format, aspect ratio, size).",
  "Analytics availability depends on each platform's permissions and API plan — some metrics may be unavailable.",
  "Image publishing depends on each platform's media upload support.",
  "Human review is strongly recommended before enabling full auto-posting.",
];