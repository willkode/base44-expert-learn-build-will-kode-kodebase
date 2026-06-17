import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALL_PLATFORMS = ["twitter", "reddit", "linkedin", "facebook", "instagram"];

// Content-mix keys -> which platform they naturally map to (null = any selected platform).
const CONTENT_MIX = {
  educational: { label: "Educational post", platform: null, content_type: "educational" },
  promotional: { label: "Promotional post", platform: null, content_type: "promotional" },
  community_question: { label: "Community question", platform: null, content_type: "community" },
  thought_leadership: { label: "Thought leadership", platform: null, content_type: "thought_leadership" },
  product_feature: { label: "Product / feature post", platform: null, content_type: "product" },
  case_study: { label: "Case study", platform: null, content_type: "case_study" },
  reddit_discussion: { label: "Reddit discussion", platform: "reddit", content_type: "discussion" },
  twitter_short: { label: "X / Twitter short post", platform: "twitter", content_type: "short" },
  linkedin_authority: { label: "LinkedIn authority post", platform: "linkedin", content_type: "thought_leadership" },
  facebook_update: { label: "Facebook Page update", platform: "facebook", content_type: "community", fb_post_type: "text" },
  facebook_offer: { label: "Facebook offer post", platform: "facebook", content_type: "promotional", fb_post_type: "link" },
  instagram_image: { label: "Instagram image caption", platform: "instagram", content_type: "visual", ig_media_type: "image" },
  instagram_reel: { label: "Instagram Reel", platform: "instagram", content_type: "visual", ig_media_type: "reel" },
  instagram_carousel: { label: "Instagram carousel", platform: "instagram", content_type: "visual", ig_media_type: "carousel" },
  instagram_story: { label: "Instagram Story", platform: "instagram", content_type: "visual", ig_media_type: "story" },
};

const RECOMMENDED = {
  twitter: ['09:00', '12:00', '17:00'],
  reddit: ['08:00', '20:00'],
  linkedin: ['08:00', '12:00'],
  facebook: ['11:00', '15:00'],
  instagram: ['11:00', '19:00'],
};

// Build future slots between start/end using a schedule (or recommended defaults).
function buildSlots({ platform, schedule, start, end }) {
  const slots = [];
  const times = (schedule && schedule.posting_times && schedule.posting_times.length)
    ? schedule.posting_times : (RECOMMENDED[platform] || ['09:00']);
  const allowedDays = (schedule && schedule.days_of_week && schedule.days_of_week.length)
    ? schedule.days_of_week : [0, 1, 2, 3, 4, 5, 6];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const last = new Date(end);
  while (cur <= last) {
    if (allowedDays.includes(cur.getDay())) {
      for (const t of times) {
        const [h, m] = t.split(':').map(Number);
        const slot = new Date(cur);
        slot.setHours(h, m || 0, 0, 0);
        if (slot.getTime() > Date.now()) slots.push(slot);
      }
    }
    cur.setDate(cur.getDate() + 1);
  }
  return slots.sort((a, b) => a - b);
}

// Safety heuristics on generated copy.
function safetyWarnings(platform, item) {
  const w = [];
  const text = `${item.title || ''} ${item.body || ''} ${item.text || ''} ${item.caption || ''}`.toLowerCase();
  if (platform === 'reddit') {
    const promo = ['buy now', 'sign up', 'limited time', 'discount', 'our product', 'check out our', 'use code'];
    if (promo.some((p) => text.includes(p))) w.push("Reddit copy may read as promotional — keep it discussion-first.");
  }
  if (platform === 'facebook') {
    const bait = ['like and share', 'tag a friend', 'comment below', 'share if you', 'double tap', 'like if'];
    if (bait.some((p) => text.includes(p))) w.push("Facebook copy may look like engagement bait — soften the call to action.");
  }
  if (platform === 'instagram') {
    if (!item.media_plan && !item.image_prompt) w.push("Instagram post has no media plan — add an image/Reel concept before scheduling.");
  }
  return w;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const {
      mode = 'plan', // 'plan' (preview) | 'confirm' (schedule)
      campaign_id,
      date_range_start,
      date_range_end,
      selected_platforms = [],
      posting_schedule_id = null,
      number_of_posts = 6,
      approval_mode = 'require_review', // require_review | auto_approve
      content_mix = [],
      custom_instructions = '',
      generate_images = false,
      plan = [], // edited plan for confirm mode
      timezone = 'America/Chicago',
    } = body || {};

    // ---- Shared validation (both modes) ----
    if (!campaign_id) return Response.json({ success: false, error: 'A campaign is required.' }, { status: 400 });
    const platforms = selected_platforms.filter((p) => ALL_PLATFORMS.includes(p));
    if (platforms.length === 0) return Response.json({ success: false, error: 'Select at least one platform.' }, { status: 400 });

    const campaign = await base44.asServiceRole.entities.SocialCampaign.get(campaign_id).catch(() => null);
    if (!campaign) return Response.json({ success: false, error: 'Campaign not found.' }, { status: 404 });

    const brands = await base44.asServiceRole.entities.BrandProfile.filter({ account_id: 'global' }, '-created_date', 1);
    const brand = brands && brands[0] ? brands[0] : null;
    if (!brand) return Response.json({ success: false, error: 'Set up a brand profile before auto-filling the calendar.' }, { status: 400 });

    // Connected accounts per selected platform.
    const accounts = await base44.asServiceRole.entities.SocialAccount.list('-created_date', 200);
    const accountByPlatform = {};
    for (const a of accounts) {
      if (a.connection_status === 'connected' && platforms.includes(a.platform) && !accountByPlatform[a.platform]) {
        accountByPlatform[a.platform] = a;
      }
    }
    const accountWarnings = [];
    for (const p of platforms) {
      const acc = accountByPlatform[p];
      if (!acc) { accountWarnings.push(`${p}: no connected account — posts will be created but cannot be scheduled.`); continue; }
      if (p === 'facebook' && !(acc.selected_default_facebook_page_id || acc.facebook_page_id)) {
        accountWarnings.push('Facebook: connect/select a Facebook Page to schedule.');
      }
      if (p === 'instagram' && !(acc.selected_default_instagram_account_id || acc.instagram_business_account_id)) {
        accountWarnings.push('Instagram: connect a professional account to schedule.');
      }
    }

    // Posting schedule (optional).
    let schedule = null;
    if (posting_schedule_id) {
      schedule = await base44.asServiceRole.entities.PostingSchedule.get(posting_schedule_id).catch(() => null);
      if (!schedule) return Response.json({ success: false, error: 'Posting schedule not found.' }, { status: 404 });
    }

    const start = date_range_start ? new Date(date_range_start) : new Date(Date.now() + 86400000);
    const end = date_range_end ? new Date(date_range_end) : new Date(Date.now() + 14 * 86400000);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return Response.json({ success: false, error: 'Invalid date range.' }, { status: 400 });
    }

    const brandContext = `BRAND: ${brand.brand_name || '—'} | Audience: ${brand.audience || '—'} | Tone: ${brand.tone_of_voice || brand.preferred_tone || '—'} | Value props: ${(brand.value_propositions || []).join('; ') || '—'} | Default CTA: ${brand.default_call_to_action || '—'} | Avoid: ${(brand.banned_words || []).join(', ') || '—'}`;
    const campaignContext = `CAMPAIGN: ${campaign.name} | Goal: ${campaign.goal} | Key message: ${campaign.key_message || '—'} | Themes: ${(campaign.content_themes || []).join('; ') || '—'} | Offer: ${campaign.offer_details || '—'} | Landing page: ${campaign.landing_page_url || '—'}`;

    // =========================================================
    // MODE: PLAN — generate a balanced content plan (no scheduling).
    // =========================================================
    if (mode === 'plan') {
      const mix = (content_mix && content_mix.length ? content_mix : ['educational', 'thought_leadership', 'product_feature', 'community_question'])
        .filter((m) => CONTENT_MIX[m]);
      const count = Math.max(1, Math.min(30, Number(number_of_posts) || 6));

      // Round-robin the requested mix into N items, mapping each to a target platform.
      const items = [];
      for (let i = 0; i < count; i++) {
        const mixKey = mix[i % mix.length];
        const def = CONTENT_MIX[mixKey];
        // Platform: mix-locked platform if selected, else round-robin across selected platforms.
        let platform = def.platform && platforms.includes(def.platform) ? def.platform : platforms[i % platforms.length];
        items.push({ index: i, mix_key: mixKey, mix_label: def.label, platform, content_type: def.content_type, def });
      }

      const planSchema = {
        type: "object",
        properties: {
          posts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                index: { type: "number" },
                title_internal: { type: "string" },
                topic: { type: "string" },
                platform: { type: "string" },
                content: { type: "string" },
                reddit_title: { type: "string" },
                reddit_body: { type: "string" },
                facebook_post_type: { type: "string" },
                facebook_cta: { type: "string" },
                instagram_media_type: { type: "string" },
                instagram_first_comment: { type: "string" },
                media_plan: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } },
                image_prompt: { type: "string" },
                image_alt_text: { type: "string" },
              },
            },
          },
        },
      };

      const prompt = `You are a senior social media strategist. Build a balanced, NON-duplicate content plan of ${count} posts for the campaign below. Each post targets ONE platform and must be adapted to that platform's norms — never reuse the same wording across platforms.

${brandContext}

${campaignContext}

CUSTOM INSTRUCTIONS: ${custom_instructions || '—'}

POSTS TO WRITE (respect the platform and content angle for each index):
${items.map((it) => `- index ${it.index}: ${it.mix_label} for ${it.platform}`).join('\n')}

PER-PLATFORM REQUIREMENTS:
- twitter: punchy "content" under ~280 chars, 1-3 hashtags.
- reddit: discussion-first. Provide "reddit_title" and "reddit_body". Must NOT sound like an ad.
- linkedin: authority "content" with a hook, short paragraphs, 3-5 end hashtags.
- facebook: conversational "content". Set "facebook_post_type" (text/link/photo/video). NO engagement bait (no "tag a friend", "like and share"). Add "facebook_cta" when natural.
- instagram: visual-first "content" caption. Set "instagram_media_type" (image/reel/carousel/story). ALWAYS include a "media_plan" describing the visual, plus "image_prompt", "image_alt_text", and optional "instagram_first_comment".

For EVERY post provide: title_internal (internal label), topic, platform, content, hashtags, and (for visual platforms) image_prompt + image_alt_text.
IMAGE PROMPTS MUST follow this exact style: dark tech aesthetic, deep navy background (#0d1326 / #0a0f1e), glowing orange-to-red gradient accents (#f87171 → #fb923c → #facc15), minimal flat vector with subtle blueprint grid lines and soft glows, no text/logos/watermarks, high contrast, ample negative space.
Keep all content factual — never invent stats, testimonials, or numbers.`;

      const ai = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'gpt_5_5',
        response_json_schema: planSchema,
      });

      const aiPosts = ai.posts || [];
      const byIndex = {};
      aiPosts.forEach((p) => { byIndex[p.index] = p; });

      // Pre-compute slots per platform so the preview shows proposed times.
      const slotsByPlatform = {};
      for (const p of platforms) {
        slotsByPlatform[p] = buildSlots({ platform: p, schedule, start, end });
      }
      const slotCursor = {};
      platforms.forEach((p) => { slotCursor[p] = 0; });

      const planOut = items.map((it) => {
        const g = byIndex[it.index] || {};
        const platform = (g.platform && platforms.includes(g.platform)) ? g.platform : it.platform;
        const slots = slotsByPlatform[platform] || [];
        const slot = slots[slotCursor[platform]] || null;
        if (slot) slotCursor[platform] += 1;

        const item = {
          index: it.index,
          mix_key: it.mix_key,
          mix_label: it.mix_label,
          platform,
          title_internal: g.title_internal || it.mix_label,
          topic: g.topic || '',
          content: g.content || g.reddit_body || '',
          reddit_title: g.reddit_title || '',
          reddit_body: g.reddit_body || '',
          facebook_post_type: g.facebook_post_type || it.def.fb_post_type || 'text',
          facebook_cta: g.facebook_cta || '',
          instagram_media_type: g.instagram_media_type || it.def.ig_media_type || 'image',
          instagram_first_comment: g.instagram_first_comment || '',
          media_plan: g.media_plan || '',
          hashtags: g.hashtags || [],
          image_prompt: g.image_prompt || '',
          image_alt_text: g.image_alt_text || '',
          scheduled_at: slot ? slot.toISOString() : null,
        };
        item.warnings = safetyWarnings(platform, item);
        return item;
      });

      return Response.json({
        success: true,
        mode: 'plan',
        plan: planOut,
        campaign: { id: campaign.id, name: campaign.name, approval_required: campaign.approval_required !== false },
        account_warnings: accountWarnings,
        timezone: schedule?.timezone || timezone,
      });
    }

    // =========================================================
    // MODE: CONFIRM — create SocialPost + ScheduledPost from the (edited) plan.
    // =========================================================
    if (!Array.isArray(plan) || plan.length === 0) {
      return Response.json({ success: false, error: 'No posts in the plan to schedule.' }, { status: 400 });
    }

    const approvalRequired = campaign.approval_required !== false;
    // Auto-approve only honored when the campaign allows it.
    const approvalStatus = (approval_mode === 'auto_approve' && !approvalRequired) ? 'approved' : 'needs_review';

    const created = [];
    const scheduledJobs = [];
    const errors = [];
    const usedSlots = new Set();

    for (const item of plan) {
      const platform = item.platform;
      if (!ALL_PLATFORMS.includes(platform)) { errors.push(`Skipped post with unknown platform.`); continue; }

      // Build platform_variants for this single-platform post.
      const pv = {};
      if (platform === 'twitter') {
        pv.twitter_text = item.content || '';
        pv.twitter_thread = item.twitter_thread || [];
      } else if (platform === 'reddit') {
        pv.reddit_title = item.reddit_title || item.title_internal || '';
        pv.reddit_body = item.reddit_body || item.content || '';
      } else if (platform === 'linkedin') {
        pv.linkedin_text = item.content || '';
      } else if (platform === 'facebook') {
        pv.facebook_text = item.content || '';
        pv.facebook_cta = item.facebook_cta || '';
        pv.facebook_link_url = item.facebook_post_type === 'link' ? (campaign.landing_page_url || '') : '';
        pv.facebook_post_type = item.facebook_post_type || 'text';
      } else if (platform === 'instagram') {
        pv.instagram_caption = item.content || '';
        pv.instagram_media_type = item.instagram_media_type || 'image';
        pv.instagram_alt_text = item.image_alt_text || '';
        pv.instagram_first_comment = item.instagram_first_comment || '';
        pv.instagram_hashtags = item.hashtags || [];
      }

      // Optionally generate an image now (visual platforms / when requested).
      let imageUrl = item.image_url || '';
      if (generate_images && item.image_prompt && !imageUrl) {
        try {
          const img = await base44.integrations.Core.GenerateImage({ prompt: item.image_prompt });
          imageUrl = img?.url || '';
        } catch (_e) { /* image generation best-effort */ }
      }

      const post = await base44.asServiceRole.entities.SocialPost.create({
        account_id: 'global',
        user_id: user.id,
        campaign_id: campaign.id,
        title_internal: item.title_internal || 'Auto-fill post',
        content: item.content || item.reddit_body || '',
        platform_variants: pv,
        hashtags: item.hashtags || [],
        image_prompt: item.image_prompt || '',
        image_url: imageUrl,
        image_alt_text: item.image_alt_text || '',
        selected_platforms: [platform],
        approval_status: approvalStatus,
        publishing_status: 'unscheduled',
        ai_model_used: 'gpt_5_5',
        ai_generation_input: item.topic || campaign.key_message || '',
        created_by: user.email,
      });
      created.push(post);

      // Schedule a future slot only when approved AND an account is connected.
      const acc = accountByPlatform[platform];
      const when = item.scheduled_at ? new Date(item.scheduled_at) : null;
      const canSchedule = approvalStatus === 'approved' && acc && when && when.getTime() > Date.now();

      if (canSchedule) {
        // Avoid double-booking the exact same slot across this batch.
        let slotMs = when.getTime();
        const key = `${platform}:${slotMs}`;
        if (usedSlots.has(key)) { slotMs += 60000; }
        usedSlots.add(`${platform}:${slotMs}`);
        const whenIso = new Date(slotMs).toISOString();

        const sched = await base44.functions.invoke('scheduleSocialPost', {
          social_post_id: post.id,
          timezone: schedule?.timezone || timezone,
          platform_jobs: [{
            platform,
            social_account_id: acc.id,
            scheduled_at: whenIso,
            overrides: platform === 'reddit'
              ? { subreddit: item.subreddit || '', title: pv.reddit_title, body: pv.reddit_body, reddit_post_kind: 'self', promotion_disclosure: item.promotion_disclosure || '' }
              : {},
          }],
        });
        const sd = sched?.data || {};
        if (sd.success) scheduledJobs.push(...(sd.created || []));
        else (sd.errors || [`Could not schedule ${platform} post.`]).forEach((e) => errors.push(e));
      } else if (approvalStatus !== 'approved') {
        // Needs-review posts wait for manual approval before scheduling.
      } else if (!acc) {
        errors.push(`${platform}: created as draft (no connected account to schedule).`);
      }
    }

    await base44.asServiceRole.entities.SocialAutomationLog.create({
      account_id: 'global',
      user_id: user.id,
      event_type: 'calendar_autofill',
      related_campaign_id: campaign.id,
      status: errors.length ? 'warning' : 'success',
      message: `Auto-fill created ${created.length} post(s), scheduled ${scheduledJobs.length} job(s) for "${campaign.name}".`,
      metadata: { posts: created.length, scheduled: scheduledJobs.length, approval_mode, platforms, errors: errors.slice(0, 20) },
    });

    return Response.json({
      success: true,
      mode: 'confirm',
      created_count: created.length,
      scheduled_count: scheduledJobs.length,
      approval_status: approvalStatus,
      errors,
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});