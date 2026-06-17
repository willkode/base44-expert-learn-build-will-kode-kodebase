import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Resolves the per-platform publish payload from a SocialPost + selected account.
function buildPayload(platform, post, account, overrides) {
  const v = post.platform_variants || {};
  const o = overrides || {};
  if (platform === 'twitter') {
    return { message: o.message || v.twitter_text || post.content || '', thread: v.twitter_thread || [], media_urls: post.image_url ? [post.image_url] : [] };
  }
  if (platform === 'reddit') {
    const kind = o.reddit_post_kind || 'self';
    const media = o.media_urls && o.media_urls.length ? o.media_urls : (post.image_url ? [post.image_url] : []);
    return {
      subreddit: (o.subreddit || '').trim(),
      reddit_post_kind: kind,
      title: o.title || v.reddit_title || post.title_internal || '',
      body: o.body || o.message || v.reddit_body || post.content || '',
      link_url: o.link_url || '',
      media_urls: media,
      flair_id: o.flair_id || '',
      flair_text: o.flair_text || '',
      nsfw: !!o.nsfw,
      spoiler: !!o.spoiler,
      send_replies: o.send_replies !== false,
      suggested_comment: o.suggested_comment || '',
      promotion_disclosure: o.promotion_disclosure || '',
      subreddit_rules_notes: o.subreddit_rules_notes || '',
    };
  }
  if (platform === 'linkedin') {
    return {
      author_urn: o.author_urn || account.selected_default_author_urn || account.linkedin_person_urn || '',
      author_type: o.author_type || 'person',
      commentary: o.commentary || o.message || v.linkedin_text || post.content || '',
      visibility: o.visibility || 'PUBLIC',
      media_url: o.media_url || post.image_url || '',
      media_title: o.media_title || post.image_alt_text || '',
      image_urn: '',
      distribution: o.distribution || {},
    };
  }
  if (platform === 'facebook') {
    const pageId = o.facebook_page_id || account.selected_default_facebook_page_id || account.facebook_page_id || '';
    const media = v.facebook_media_urls && v.facebook_media_urls.length ? v.facebook_media_urls : (post.image_url ? [post.image_url] : []);
    return {
      facebook_page_id: pageId,
      message: o.message || v.facebook_text || post.content || '',
      link_url: v.facebook_link_url || '',
      media_urls: media,
      post_type: v.facebook_post_type || (media.length ? 'photo' : (v.facebook_link_url ? 'link' : 'text')),
      call_to_action: v.facebook_cta || '',
      published: true,
    };
  }
  if (platform === 'instagram') {
    const igId = o.instagram_business_account_id || account.selected_default_instagram_account_id || account.instagram_business_account_id || '';
    const media = (o.media_urls && o.media_urls.length)
      ? o.media_urls
      : (v.instagram_media_urls && v.instagram_media_urls.length ? v.instagram_media_urls : (post.image_url ? [post.image_url] : []));
    return {
      instagram_business_account_id: igId,
      caption: o.caption || v.instagram_caption || '',
      media_urls: media,
      media_type: o.media_type || v.instagram_media_type || 'image',
      alt_text: o.alt_text || v.instagram_alt_text || post.image_alt_text || '',
      first_comment: o.first_comment || v.instagram_first_comment || '',
      hashtags: o.hashtags || v.instagram_hashtags || [],
      share_to_feed: o.share_to_feed !== false,
    };
  }
  return { message: post.content || '' };
}

function validatePlatform(platform, post, account, overrides) {
  if (!account || account.connection_status !== 'connected') {
    return `${platform} requires a connected account.`;
  }
  if (platform === 'reddit') {
    const o = overrides || {};
    const v = post.platform_variants || {};
    const title = o.title || v.reddit_title || post.title_internal || '';
    const kind = o.reddit_post_kind || 'self';
    if (!(o.subreddit || '').trim()) return 'Reddit requires a target subreddit.';
    if (!title.trim()) return 'Reddit requires a post title.';
    if (kind === 'self' && !((o.body || o.message || v.reddit_body || post.content || '').trim())) return 'Reddit text posts require a body.';
    if (kind === 'link' && !((o.link_url || '').trim())) return 'Reddit link posts require a URL.';
    if (kind === 'image' && !((o.media_urls && o.media_urls.length) || post.image_url)) return 'Reddit image posts require an image.';
  }
  if (platform === 'linkedin') {
    const o = overrides || {};
    const v = post.platform_variants || {};
    const authorUrn = o.author_urn || account.selected_default_author_urn || account.linkedin_person_urn || '';
    const authorType = o.author_type || 'person';
    const commentary = o.commentary || o.message || v.linkedin_text || post.content || '';
    if (!authorUrn.trim()) return 'LinkedIn requires a selected author (profile or page).';
    if (!commentary.trim()) return 'LinkedIn requires post text.';
    if (authorType === 'person' && account.can_post_as_person === false) return 'This LinkedIn account cannot post to a personal profile.';
    if (authorType === 'organization') {
      if (account.can_post_as_organization === false) return 'This LinkedIn account cannot post as an organization.';
      if (!o.organization_role_confirmed) return 'Confirm your organization posting role before scheduling a page post.';
    }
  }
  if (platform === 'facebook') {
    const pageId = account.selected_default_facebook_page_id || account.facebook_page_id;
    if (!pageId) return 'Facebook requires a connected Facebook Page.';
  }
  if (platform === 'instagram') {
    const o = overrides || {};
    const v = post.platform_variants || {};
    const igId = o.instagram_business_account_id || account.selected_default_instagram_account_id || account.instagram_business_account_id;
    if (!igId) return 'Instagram requires a connected professional account.';
    const mediaList = (o.media_urls && o.media_urls.length)
      ? o.media_urls
      : (v.instagram_media_urls && v.instagram_media_urls.length ? v.instagram_media_urls : (post.image_url ? [post.image_url] : []));
    const media = mediaList.filter((m) => (m || '').trim());
    // Visual-first: never allow text-only Instagram posts.
    if (!media.length) return 'Instagram requires valid media — text-only posts are not allowed.';
    const mediaType = o.media_type || v.instagram_media_type || 'image';
    if (mediaType === 'carousel' && media.length < 2) return 'Instagram carousels require at least 2 media items.';
    if (mediaType === 'carousel' && media.length > 10) return 'Instagram carousels allow at most 10 media items.';
    if (mediaType !== 'carousel' && media.length > 1) return `Instagram ${mediaType} posts allow only one media item — use a carousel for multiple.`;
    const isVideo = (u) => /\.(mp4|mov|m4v|webm)(\?|$)/i.test(u || '');
    if ((mediaType === 'reel' || mediaType === 'video') && !media.some(isVideo)) {
      return `Instagram ${mediaType} posts require a valid video file.`;
    }
  }
  return null;
}

// Schedules one approved SocialPost across one or more platforms, creating ScheduledPost jobs.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { social_post_id, platform_jobs, timezone, allow_duplicates } = body || {};
    if (!social_post_id) return Response.json({ success: false, error: 'social_post_id is required.' }, { status: 400 });
    if (!Array.isArray(platform_jobs) || platform_jobs.length === 0) {
      return Response.json({ success: false, error: 'At least one platform job is required.' }, { status: 400 });
    }

    const post = await base44.asServiceRole.entities.SocialPost.get(social_post_id);
    if (!post) return Response.json({ success: false, error: 'Post not found.' }, { status: 404 });
    if (post.approval_status !== 'approved') {
      return Response.json({ success: false, error: 'Only approved posts can be scheduled.' }, { status: 400 });
    }

    const accounts = await base44.asServiceRole.entities.SocialAccount.list('-created_date', 200);
    const accountById = {};
    for (const a of accounts) accountById[a.id] = a;

    // Existing jobs for duplicate detection.
    const existingJobs = await base44.asServiceRole.entities.ScheduledPost.filter({ social_post_id });

    const created = [];
    const errors = [];

    for (const job of platform_jobs) {
      const { platform, social_account_id, scheduled_at, overrides } = job || {};
      if (!platform || !social_account_id || !scheduled_at) {
        errors.push(`Each platform job needs platform, account, and scheduled time.`);
        continue;
      }

      const when = new Date(scheduled_at);
      if (isNaN(when.getTime())) { errors.push(`Invalid date for ${platform}.`); continue; }
      if (when.getTime() <= Date.now()) { errors.push(`${platform}: cannot schedule in the past.`); continue; }

      const account = accountById[social_account_id];
      const reason = validatePlatform(platform, post, account, overrides);
      if (reason) { errors.push(reason); continue; }

      // Duplicate guard: same post + platform + account, not canceled.
      const dup = existingJobs.find(
        (j) => j.platform === platform && j.social_account_id === social_account_id && !['canceled', 'failed'].includes(j.status)
      );
      if (dup && !allow_duplicates) {
        errors.push(`${platform}: a scheduled job already exists for this account. Confirm duplication to add another.`);
        continue;
      }

      const payload = buildPayload(platform, post, account, overrides);
      const rec = await base44.asServiceRole.entities.ScheduledPost.create({
        social_post_id,
        campaign_id: post.campaign_id || undefined,
        social_account_id,
        platform,
        platform_specific_payload: payload,
        scheduled_at: when.toISOString(),
        timezone: timezone || 'America/Chicago',
        status: 'queued',
      });
      created.push(rec);
    }

    if (created.length > 0) {
      await base44.asServiceRole.entities.SocialPost.update(social_post_id, {
        publishing_status: 'scheduled',
        scheduled_at: created[0].scheduled_at,
        timezone: timezone || post.timezone || 'America/Chicago',
      });
      await base44.asServiceRole.entities.SocialAutomationLog.create({
        account_id: 'global',
        event_type: 'scheduled',
        related_post_id: social_post_id,
        related_campaign_id: post.campaign_id || undefined,
        status: errors.length ? 'warning' : 'success',
        message: `Scheduled ${created.length} platform job(s) for "${post.title_internal || 'post'}".`,
        metadata: { platforms: created.map((c) => c.platform), errors },
      });
      try {
        await base44.asServiceRole.entities.SocialNotification.create({
          account_id: 'global',
          user_id: user.id,
          event_type: 'post_scheduled',
          title: 'Post scheduled',
          message: `"${post.title_internal || 'A post'}" was scheduled across ${created.length} platform(s).`,
          related_record_type: 'SocialPost',
          related_record_id: social_post_id,
          severity: 'success',
          read: false,
        });
      } catch (_e) { /* best-effort */ }
    }

    return Response.json({ success: created.length > 0, created, errors });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});