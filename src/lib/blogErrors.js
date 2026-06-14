// Centralized blog error mapping.
// Turns raw backend/validation error strings into user-friendly guidance:
//   { title, explanation, nextStep, actions: [actionKey] }
// Action keys are resolved to buttons by BlogErrorAlert.

// Action keys understood by BlogErrorAlert:
//  edit_post, fix_seo, generate_fields, reschedule, retry_publish,
//  view_logs, configure_settings, connect_search_console

const RULES = [
  {
    match: /missing.*title|title.*required|valid title/i,
    title: "Title is missing",
    explanation: "This post doesn't have a title, which is required before it can be saved, scheduled, or published.",
    nextStep: "Open the post and add a clear, keyword-rich title.",
    actions: ["edit_post", "generate_fields"],
  },
  {
    match: /content is required|missing.*content|content.*required/i,
    title: "Content is missing",
    explanation: "The post body is empty or too short to publish.",
    nextStep: "Add content in the editor, or generate a draft with AI.",
    actions: ["edit_post", "generate_fields"],
  },
  {
    match: /slug is already in use|duplicate slug|already in use by another/i,
    title: "Duplicate slug",
    explanation: "Another post already uses this URL slug. Slugs must be unique across the blog.",
    nextStep: "Edit the post and change the slug to something unique.",
    actions: ["edit_post"],
  },
  {
    match: /invalid.*slug|valid.*slug|slug.*invalid/i,
    title: "Invalid slug",
    explanation: "The slug contains characters that aren't allowed. Use only lowercase letters, numbers, and hyphens.",
    nextStep: "Edit the post and fix the slug (e.g. my-post-title).",
    actions: ["edit_post"],
  },
  {
    match: /must be approved|approval|not approved/i,
    title: "Approval required",
    explanation: "Your blog settings require posts to be approved before they go live, and this post isn't approved yet.",
    nextStep: "Submit the post for review and approve it, or relax the approval requirement in settings.",
    actions: ["edit_post", "configure_settings"],
  },
  {
    match: /in the future|date.*past|past date|scheduled.*future/i,
    title: "Scheduled date is in the past",
    explanation: "You can only schedule a post for a time that hasn't happened yet.",
    nextStep: "Pick a future date and time, then reschedule.",
    actions: ["reschedule", "edit_post"],
  },
  {
    match: /blog (is )?disabled|blogenabled|blog.*turned off/i,
    title: "Blog is disabled",
    explanation: "The blog is currently turned off, so posts can't be published or shown publicly.",
    nextStep: "Enable the blog in settings, then try again.",
    actions: ["configure_settings"],
  },
  {
    match: /critical.*seo|seo.*critical|seo issue/i,
    title: "Critical SEO issue",
    explanation: "This post has SEO problems serious enough to block publishing (e.g. missing meta, no target keyword).",
    nextStep: "Run the SEO fixer or update the SEO fields, then re-check.",
    actions: ["fix_seo", "edit_post"],
  },
  {
    match: /image generation failed|failed.*image|could not generate.*image/i,
    title: "Image generation failed",
    explanation: "The AI featured-image generation didn't complete. This can happen on a temporary provider hiccup.",
    nextStep: "Retry image generation, or upload a featured image manually.",
    actions: ["edit_post", "view_logs"],
  },
  {
    match: /ai (generation )?failed|generation failed|llm.*failed|empty result/i,
    title: "AI generation failed",
    explanation: "The AI couldn't generate the requested content this time.",
    nextStep: "Try again — if it keeps failing, simplify the brief or edit the post manually.",
    actions: ["edit_post", "view_logs"],
  },
  {
    match: /publish(ing)? failed|could not publish|publish error/i,
    title: "Publishing failed",
    explanation: "Something went wrong while publishing this post, so it didn't go live.",
    nextStep: "Retry publishing. If it keeps failing, check the logs for details.",
    actions: ["retry_publish", "view_logs"],
  },
  {
    match: /route not found|public route|page not found/i,
    title: "Public route not found",
    explanation: "The public blog route couldn't be resolved, so the post URL may not work.",
    nextStep: "Check the public blog route in settings.",
    actions: ["configure_settings"],
  },
  {
    match: /analytics.*fail|tracking failed|track.*error/i,
    title: "Analytics tracking failed",
    explanation: "A tracking event couldn't be recorded. This won't affect your published content.",
    nextStep: "This is usually temporary. Check the logs if it persists.",
    actions: ["view_logs"],
  },
  {
    match: /search console.*(fail|not connected|connection)|gsc.*fail/i,
    title: "Search Console connection failed",
    explanation: "We couldn't reach Google Search Console, so SEO insights couldn't be synced.",
    nextStep: "Reconnect Search Console and pick a property, then sync again.",
    actions: ["connect_search_console", "view_logs"],
  },
  {
    match: /internal link.*(fail|apply)|link apply failed/i,
    title: "Internal link couldn't be applied",
    explanation: "Applying the internal link suggestion failed — the anchor text may no longer exist in the post.",
    nextStep: "Re-run link suggestions or add the link manually in the editor.",
    actions: ["edit_post", "view_logs"],
  },
];

const FALLBACK = {
  title: "Something went wrong",
  explanation: "An unexpected error occurred while completing this action.",
  nextStep: "Try again. If the problem continues, check the automation logs for details.",
  actions: ["view_logs"],
};

// Resolve a raw error string/Error/axios-error into friendly guidance.
export function mapBlogError(error) {
  const raw =
    typeof error === "string"
      ? error
      : error?.response?.data?.error || error?.message || "";
  const rule = RULES.find((r) => r.match.test(raw));
  return { ...(rule || FALLBACK), raw };
}