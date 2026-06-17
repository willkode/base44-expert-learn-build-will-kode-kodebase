// Maps the editable studio result + selected variants into SocialPost records.
import { base44 } from "@/api/base44Client";

function buildPlatformVariant(platform, v, result, campaign) {
  const pv = {};
  if (platform === "twitter") {
    pv.twitter_text = v.text || "";
    pv.twitter_thread = v.thread || [];
  } else if (platform === "reddit") {
    pv.reddit_title = v.title || "";
    pv.reddit_body = v.body || "";
  } else if (platform === "linkedin") {
    pv.linkedin_text = v.text || "";
  } else if (platform === "facebook") {
    pv.facebook_text = v.text || "";
    pv.facebook_cta = v.cta || "";
    pv.facebook_link_url = v.link_url || (campaign && campaign.landing_page_url) || "";
    pv.facebook_post_type = v.post_type || "text";
  } else if (platform === "instagram") {
    pv.instagram_caption = v.caption || "";
    pv.instagram_media_type = v.media_type || "image";
    pv.instagram_alt_text = v.alt_text || result.image_alt_text || "";
    pv.instagram_first_comment = v.first_comment || "";
    pv.instagram_hashtags = v.hashtags || [];
  }
  return pv;
}

function primaryText(platform, v) {
  if (platform === "reddit") return v.body || v.title || "";
  if (platform === "instagram") return v.caption || "";
  return v.text || "";
}

// Creates one SocialPost per selected platform using its chosen variant.
export async function saveStudioPosts({ result, selectedIndexes, form, campaign, user, approvalStatus }) {
  const platforms = Object.keys(result.platform_variants || {});
  const created = [];

  for (const platform of platforms) {
    const variants = result.platform_variants[platform] || [];
    const idx = selectedIndexes[platform] ?? 0;
    const v = variants[idx];
    if (!v) continue;

    const record = {
      account_id: "global",
      user_id: user?.id,
      campaign_id: form.campaign_id || undefined,
      title_internal: result.title_internal || form.topic.slice(0, 80),
      content: primaryText(platform, v),
      platform_variants: buildPlatformVariant(platform, v, result, campaign),
      hashtags: form.include_hashtags ? (v.hashtags || result.global_hashtags || []) : [],
      image_prompt: form.include_image_prompt ? (result.image_prompt || "") : "",
      image_url: result.image_url || "",
      image_alt_text: form.include_image_prompt ? (result.image_alt_text || "") : "",
      selected_platforms: [platform],
      approval_status: approvalStatus,
      publishing_status: "unscheduled",
      ai_model_used: "gpt_5_5",
      ai_generation_input: form.topic,
      created_by: user?.email,
    };
    const rec = await base44.entities.SocialPost.create(record);
    created.push(rec);
  }
  return created;
}