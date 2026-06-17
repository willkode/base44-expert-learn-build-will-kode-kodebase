// Shared config, validation, and heuristics for LinkedIn publishing.

export const LINKEDIN_AUTHOR_TYPES = [
  { key: "person", label: "Personal profile" },
  { key: "organization", label: "Company page" },
];

export const LINKEDIN_VISIBILITY = [
  { key: "PUBLIC", label: "Public" },
  { key: "CONNECTIONS", label: "Connections only" },
  { key: "LOGGED_IN", label: "Logged-in members" },
];

// AI assistant actions surfaced in the LinkedIn panel.
export const LINKEDIN_AI_ACTIONS = [
  { key: "thought_leadership", label: "Thought leadership" },
  { key: "founder_insight", label: "Founder insight" },
  { key: "educational", label: "Educational post" },
  { key: "product_announcement", label: "Product announcement" },
  { key: "add_cta", label: "Add professional CTA" },
  { key: "add_hashtags", label: "Add 3–5 hashtags" },
  { key: "improve_hook", label: "Improve opening hook" },
  { key: "make_skimmable", label: "Make more skimmable" },
];

export const LINKEDIN_MAX_LENGTH = 3000;

// Returns { errors, warnings } for a LinkedIn setup payload.
// `account` is used to confirm posting permissions for the chosen author type.
export function validateLinkedInPayload(linkedin = {}, account = null) {
  const errors = [];
  const warnings = [];
  const authorType = linkedin.author_type || "person";
  const authorUrn = (linkedin.author_urn || "").trim();
  const commentary = (linkedin.commentary || "").trim();

  if (!authorUrn) errors.push("Select a LinkedIn author (profile or page).");
  if (!commentary) errors.push("Post text is required.");
  if (commentary.length > LINKEDIN_MAX_LENGTH) {
    errors.push(`LinkedIn posts must be ${LINKEDIN_MAX_LENGTH.toLocaleString()} characters or fewer.`);
  }

  // Confirm the connected account is allowed to post as the chosen author type.
  if (account) {
    if (authorType === "person" && account.can_post_as_person === false) {
      errors.push("This account doesn't have permission to post to a personal profile.");
    }
    if (authorType === "organization") {
      if (account.can_post_as_organization === false) {
        errors.push("This account doesn't have permission to post as an organization.");
      }
      if (!linkedin.organization_role_confirmed) {
        errors.push("Confirm your organization posting role before scheduling a page post.");
      }
    }
  }

  if (linkedin.media_url && !(linkedin.media_title || "").trim()) {
    warnings.push("Add a short media title/description for better accessibility.");
  }
  if (!hasHashtags(commentary)) {
    warnings.push("LinkedIn posts perform better with 3–5 relevant hashtags.");
  }

  return { errors, warnings };
}

export function hasHashtags(text) {
  if (!text) return false;
  return /(^|\s)#[A-Za-z0-9_]+/.test(text);
}

export function countHashtags(text) {
  if (!text) return 0;
  const m = text.match(/(^|\s)#[A-Za-z0-9_]+/g);
  return m ? m.length : 0;
}

export const EMPTY_LINKEDIN_PAYLOAD = {
  author_urn: "",
  author_type: "person",
  commentary: "",
  visibility: "PUBLIC",
  media_url: "",
  media_title: "",
  image_urn: "",
  organization_role_confirmed: false,
};