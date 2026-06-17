// Image style + aspect ratio config for the Social Content Studio.

export const IMAGE_STYLES = [
  { key: "clean_saas", label: "Clean SaaS graphic" },
  { key: "bold_promo", label: "Bold promotional graphic" },
  { key: "founder_authority", label: "Founder / authority style" },
  { key: "minimal_branded", label: "Minimal branded graphic" },
  { key: "educational_carousel", label: "Educational carousel cover" },
  { key: "app_mockup", label: "App screenshot mockup" },
  { key: "abstract_tech", label: "Abstract technology visual" },
  { key: "community_discussion", label: "Community discussion graphic" },
  { key: "product_launch", label: "Product launch graphic" },
  { key: "facebook_promo", label: "Facebook Page promo graphic" },
  { key: "instagram_reel_cover", label: "Instagram Reel cover" },
  { key: "instagram_carousel_cover", label: "Instagram carousel cover" },
  { key: "instagram_story", label: "Instagram Story graphic" },
];

export const ASPECT_RATIOS = [
  { key: "1:1", label: "Square (1:1)" },
  { key: "16:9", label: "Landscape (16:9)" },
  { key: "4:5", label: "Portrait (4:5)" },
  { key: "9:16", label: "Vertical / Story (9:16)" },
];

// Which aspect ratios each platform supports (first is the recommended default).
export const PLATFORM_ASPECTS = {
  twitter: ["16:9", "1:1"],
  reddit: ["1:1", "16:9"],
  linkedin: ["1:1", "16:9"],
  facebook: ["1:1", "16:9", "4:5", "9:16"],
  instagram: ["1:1", "4:5", "9:16"],
  general: ["1:1", "16:9", "4:5", "9:16"],
};

export const ASPECT_CLASS = {
  "1:1": "aspect-square",
  "16:9": "aspect-video",
  "4:5": "aspect-[4/5]",
  "9:16": "aspect-[9/16]",
};

// Platforms that require an image before scheduling.
export const MEDIA_REQUIRED_PLATFORMS = ["instagram"];

export function defaultAspectFor(platforms) {
  const first = (platforms || []).find((p) => PLATFORM_ASPECTS[p]);
  return first ? PLATFORM_ASPECTS[first][0] : "1:1";
}