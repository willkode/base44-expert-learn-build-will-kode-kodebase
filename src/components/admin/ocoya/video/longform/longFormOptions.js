export const PROJECT_TYPES = [
  { id: "social", label: "Social media video" },
  { id: "ad", label: "Product advertisement" },
  { id: "explainer", label: "Explainer video" },
  { id: "tutorial", label: "Tutorial" },
  { id: "story", label: "Story" },
  { id: "news", label: "News-style video" },
  { id: "cinematic", label: "Cinematic sequence" },
];

export const PLATFORM_OPTIONS = [
  { id: "tiktok", label: "TikTok", ratio: "9:16" },
  { id: "reels", label: "Instagram Reels", ratio: "9:16" },
  { id: "shorts", label: "YouTube Shorts", ratio: "9:16" },
  { id: "youtube", label: "YouTube", ratio: "16:9" },
  { id: "linkedin", label: "LinkedIn", ratio: "16:9" },
  { id: "facebook", label: "Facebook", ratio: "9:16" },
  { id: "website", label: "Website", ratio: "16:9" },
];

export const TARGET_DURATIONS = [15, 30, 45, 60, 90, 120];

export const ASPECT_RATIOS = [
  { id: "9:16", label: "9:16 vertical" },
  { id: "16:9", label: "16:9 landscape" },
];

export const VISUAL_STYLES = [
  { id: "dark_tech", label: "Dark technology (brand)" },
  { id: "cinematic", label: "Cinematic" },
  { id: "photorealistic", label: "Photorealistic" },
  { id: "corporate", label: "Corporate" },
  { id: "documentary", label: "Documentary" },
  { id: "animated", label: "Animated" },
  { id: "three_d", label: "3D" },
  { id: "illustrated", label: "Illustrated" },
  { id: "minimal", label: "Minimal" },
];

export const VOICES = [
  { id: "river", label: "River — calm, neutral" },
  { id: "honey", label: "Honey — warm, soft" },
  { id: "sunny", label: "Sunny — bright, upbeat" },
  { id: "storm", label: "Storm — formal, authoritative" },
  { id: "spark", label: "Spark — energetic, quick" },
];

export const STATUS_LABELS = {
  DRAFT: "Draft",
  PLANNING: "Script",
  STORYBOARDING: "Storyboard",
  READY_TO_GENERATE: "Ready to generate",
  GENERATING_AUDIO: "Generating audio",
  GENERATING_VIDEO: "Generating video",
  NEEDS_REVIEW: "Needs review",
  READY_TO_RENDER: "Ready to render",
  RENDERING: "Rendering",
  COMPLETE: "Complete",
  FAILED: "Failed",
  ARCHIVED: "Archived",
};

export const SCENE_STATUS_LABELS = {
  DRAFT: "Draft",
  SCRIPT_READY: "Script ready",
  STORYBOARD_READY: "Storyboard ready",
  AUDIO_READY: "Voice ready",
  VIDEO_READY: "Clip ready",
  APPROVED: "Approved",
  FAILED: "Failed",
};

export const MAX_SCENE_SECONDS = 8;

export function estimateSeconds(text) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.round((words / 2.5) * 10) / 10;
}

/** Default continuity bible seeded from the brand aesthetic. */
export function defaultContinuityBible() {
  return {
    visual_style: "Dark technology, minimal flat vector with blueprint grid lines and soft glows",
    color_palette: "#0d1326 / #0a0f1e base, coral #f87171 → orange #fb923c → amber #facc15 accents",
    lighting: "High contrast, soft directional glow from accent gradients",
    camera_style: "Slow deliberate moves — dollies, gentle parallax, no fast cuts inside a scene",
    mood: "Confident, premium, calm technical energy",
    character_rules: "No human faces unless specified; abstract figures stay identical across scenes",
    location_rules: "Same abstract dark studio space throughout unless a scene states otherwise",
    object_rules: "Recurring shapes and UI blocks keep the same form, scale and colour",
    brand_rules: "Never render text, letters, logos or watermarks in frame",
    negative_rules: "No text, no logos, no watermarks, no clutter, no washed-out lighting",
  };
}