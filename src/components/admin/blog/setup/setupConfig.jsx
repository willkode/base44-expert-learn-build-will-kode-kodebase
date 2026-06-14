// Static config for the Blog production-readiness setup guide.
// Pure data — no business logic — so the guide stays declarative and easy to scan.

// First-run checklist. `key` maps to a flag returned by getBlogSetupStatus.checklist.
export const FIRST_RUN_STEPS = [
  { key: "blogEnabled", label: "Enable the blog", to: "/admin/marketing/blog/settings", hint: "Turn the blog on in Blog Settings → General." },
  { key: "blogNameSet", label: "Set blog name & description", to: "/admin/marketing/blog/settings", hint: "Give your blog a name and description for SEO and headers." },
  { key: "authorConfigured", label: "Configure author profile", to: "/admin/marketing/blog/settings", hint: "Set the default author name, bio, and avatar." },
  { key: "seoDefaultsSet", label: "Set SEO defaults", to: "/admin/marketing/blog/settings", hint: "Meta title/description templates and canonical URL base." },
  { key: "hasCategories", label: "Create categories", to: "/admin/marketing/blog/taxonomy", hint: "Group posts into categories for landing pages." },
  { key: "hasTags", label: "Create tags", to: "/admin/marketing/blog/taxonomy", hint: "Add tags for granular topics and internal linking." },
  { key: "hasKeywords", label: "Add target keywords", to: "/admin/marketing/blog/keywords", hint: "Guide AI generation with the keywords you want to rank for." },
  { key: "hasPosts", label: "Generate your first AI blog post", to: "/admin/marketing/blog/generator", hint: "Use the Generator to draft a post from a topic or keyword." },
  { key: "hasScoredPost", label: "Review the SEO score", to: "/admin/marketing/blog/posts", hint: "Open the post editor and check the SEO score panel." },
  { key: "hasFeaturedImage", label: "Generate or upload a featured image", to: "/admin/marketing/blog/posts", hint: "Add a cover image in the editor's Featured Image panel." },
  { key: "hasApprovedPost", label: "Submit for approval & approve", to: "/admin/marketing/blog/approvals", hint: "Move a post through the review → approved workflow." },
  { key: "hasPublishedPost", label: "Schedule or publish", to: "/admin/marketing/blog/calendar", hint: "Schedule a future date or publish immediately." },
  { key: "searchConsoleConnected", label: "Connect Search Console (optional)", to: "/admin/marketing/blog/settings", hint: "Unlocks real search analytics — needs setup time to populate." },
];

// Step-by-step "how to run the blog" reference shown in the guide.
export const HOW_TO_STEPS = [
  { title: "Enable the blog", body: "In Blog Settings → General, toggle the blog on so public routes render." },
  { title: "Set name & description", body: "Add a blog name and description used in headers, SEO titles, and OG tags." },
  { title: "Configure author info", body: "Set the default author name, bio, avatar, and social links for author boxes." },
  { title: "Set SEO defaults", body: "Define meta title/description templates, canonical URL base, and default OG image." },
  { title: "Create categories & tags", body: "Add at least one category. Tags are optional but improve internal linking." },
  { title: "Generate your first post", body: "Use the Generator with a topic or target keyword to draft a full article." },
  { title: "Review the SEO score", body: "Open the editor and review the SEO score panel; apply AI fixes if needed." },
  { title: "Generate a featured image", body: "Use the Featured Image panel to generate an on-brand cover, or upload your own." },
  { title: "Approve the post", body: "Submit for review, then approve it (required when approval gating is on)." },
  { title: "Schedule or publish", body: "Pick a future date on the Calendar, or publish immediately." },
  { title: "View analytics", body: "Track pageviews, engagement, and search performance once traffic arrives." },
];

// Admin-only environment / connection checklist.
// `key` maps to getBlogSetupStatus.secrets.
export const SECRETS_CHECKLIST = [
  {
    key: "aiProvider",
    label: "AI provider (content generation)",
    detail: "Handled by the built-in AI integration — no key required.",
    required: true,
    managed: true,
  },
  {
    key: "imageProvider",
    label: "Image generation provider",
    detail: "Handled by the built-in image integration — no key required.",
    required: true,
    managed: true,
  },
  {
    key: "appPublicUrl",
    label: "APP_PUBLIC_URL",
    detail: "Your live domain. Used to build canonical URLs, sitemaps, and OG links. Set it in app secrets.",
    required: false,
    managed: false,
  },
  {
    key: "searchConsole",
    label: "Google Search Console",
    detail: "Connect in Blog Settings to pull real search impressions, clicks, and rankings.",
    required: false,
    managed: false,
  },
  {
    key: "resend",
    label: "Email notifications (Resend)",
    detail: "Optional — powers publish notifications and newsletter delivery.",
    required: false,
    managed: false,
  },
];

export const SAFETY_WARNINGS = [
  "Always review AI-generated content before publishing — accuracy is your responsibility.",
  "Do not publish unsupported claims, fake statistics, or fabricated testimonials.",
  "Manually fact-check medical, legal, financial, or other high-risk content.",
  "SEO performance takes time — rankings build over weeks, not days.",
  "Search Console data requires setup and may take days to start appearing.",
  "Changing a published post's slug can break already-indexed URLs and lose ranking.",
];