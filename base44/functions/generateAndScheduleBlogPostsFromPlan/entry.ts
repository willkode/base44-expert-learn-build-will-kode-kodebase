import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only. Generates full BlogPost drafts from a content plan's planned-post ideas.
// Builds each article inline with the same gpt_5_5 engine used by generateBlogPost
// (cross-function calls are not supported), assigns scheduled dates, sets status to
// draft/needs_review/approved/scheduled ONLY (never publishes immediately), respects
// the approval workflow, de-dupes topics/keywords, logs every step, and marks ideas created.

function norm(s) {
  return String(s || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function slugify(s) {
  return String(s || '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

// Note: stored content must stay within the BlogPost text-field limit (~10KB), so the
// engine targets a safe word budget rather than very long bodies.
const LENGTH_GUIDE = {
  short: 'about 600-800 words',
  medium: 'about 1000-1300 words',
  long: 'about 1300-1600 words',
  comprehensive: 'about 1500-1700 words',
};

// Hard ceiling for the stored markdown body (entity text-field limit safety net).
const MAX_CONTENT = 9500;

// Trim markdown to a clean paragraph/sentence boundary under the limit.
function trimContent(md) {
  let s = String(md || '');
  if (s.length <= MAX_CONTENT) return s;
  s = s.slice(0, MAX_CONTENT);
  const lastPara = s.lastIndexOf('\n\n');
  if (lastPara > MAX_CONTENT * 0.6) return s.slice(0, lastPara).trimEnd();
  const lastStop = s.lastIndexOf('. ');
  if (lastStop > MAX_CONTENT * 0.6) return s.slice(0, lastStop + 1).trimEnd();
  return s.trimEnd();
}

const DARK_TECH_STYLE = 'Dark tech aesthetic on a deep navy background (#0d1326 / #0a0f1e). Glowing orange-to-red gradient accents through coral, orange and amber (#f87171 to #fb923c to #facc15). Minimal flat vector style with subtle blueprint grid lines and soft glows. No text, no logos, no watermarks. High contrast, ample negative space, wide 16:9 composition.';

// Generates one article + optional image and creates a BlogPost. Returns the saved post.
async function generateOnePost(base44, { idea, plan, settings, linkCandidates, doGenerateImages }) {
  const tone = plan.desiredTone || settings.defaultArticleTone || 'professional, helpful, authoritative';
  const lengthKey = plan.articleLength || settings.defaultArticleLength || 'long';
  const lengthGuide = LENGTH_GUIDE[lengthKey] || LENGTH_GUIDE.long;
  const banned = (settings.bannedWords || []).join(', ');
  const preferred = (settings.preferredWords || []).join(', ');
  const brandVoice = settings.defaultBrandVoice || '';
  const ctaDefault = settings.defaultCta || '';
  const topic = idea.angle ? `${idea.title} — ${idea.angle}` : idea.title;

  const prompt = `You are an expert SEO content writer and editor for KodeBase, a developer tool that turns app ideas into build-ready blueprints (data model, roles, security rules, and copy-paste build prompts for Base44).

Write a complete, original blog article. Post type: ${idea.contentType || 'blog_post'}.
Topic: ${topic}
Primary target keyword: ${idea.targetKeyword || '(none — infer the best one)'}
Secondary keywords: ${(idea.secondaryKeywords || []).join(', ') || '(none)'}
Search intent: ${idea.searchIntent || 'informational'}
Target audience: ${plan.targetAudience || 'developers and founders building software'}
Content goal: ${plan.goal || 'educate and drive product interest'}
Tone: ${tone}
Length: ${lengthGuide}
Brand voice: ${brandVoice || '(use the tone above)'}
Default CTA to weave in (adapt, don't paste verbatim): ${ctaDefault || 'Encourage readers to try KodeBase free.'}
Custom instructions: ${plan.customInstructions || '(none)'}
Internal link candidates (use ONLY if genuinely relevant, reference by slug): ${JSON.stringify(linkCandidates)}

STRICT WRITING RULES:
- Do NOT invent statistics, testimonials, or unsupported claims.
- Do NOT keyword-stuff; use the target keyword naturally.
- Write for humans first, search engines second. Match the search intent.
- Clear headings (## and ###), short paragraphs, practical examples where useful.
- Strong intro, clear conclusion, exactly ONE main call to action.
- Avoid fluff and generic AI-sounding phrasing.
- IMPORTANT: keep the full content_markdown body under 9000 characters total. Be concise and high-signal; do not pad.
${banned ? `- Avoid these words/phrases: ${banned}.` : ''}
${preferred ? `- Prefer these words/phrases where natural: ${preferred}.` : ''}
- Produce SEO meta fields. Meta title under ~60 chars, meta description ~150 chars and click-worthy.
- Produce a featured_image_prompt describing a concrete visual subject (no text/logos) and concise featured_image_alt.

content_markdown is the full article body in markdown. Suggest one category and 3-6 tags.`;

  const ai = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'gpt_5_5',
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        recommended_title: { type: 'string' },
        slug: { type: 'string' },
        excerpt: { type: 'string' },
        content_markdown: { type: 'string' },
        meta_title: { type: 'string' },
        meta_description: { type: 'string' },
        og_title: { type: 'string' },
        og_description: { type: 'string' },
        featured_image_prompt: { type: 'string' },
        featured_image_alt: { type: 'string' },
        suggested_category: { type: 'string' },
        suggested_tags: { type: 'array', items: { type: 'string' } },
        read_minutes: { type: 'number' },
      },
      required: ['recommended_title', 'excerpt', 'content_markdown', 'meta_title', 'meta_description'],
    },
  });

  // Unique slug.
  let slug = slugify(ai.slug || ai.recommended_title || idea.title);
  if (!slug) slug = `post-${Date.now()}`;
  const clash = await base44.asServiceRole.entities.BlogPost.filter({ slug });
  if (clash.length > 0) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  // Optional dark-tech featured image (non-blocking).
  let coverImageUrl = '';
  if (doGenerateImages && settings.enableAiImageGeneration !== false) {
    const subject = ai.featured_image_prompt || `${idea.title} concept`;
    const style = settings.defaultFeaturedImageStyle || DARK_TECH_STYLE;
    try {
      const img = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt: `${subject}. ${style}` });
      coverImageUrl = img?.url || '';
    } catch (_e) { /* image is non-blocking */ }
  }

  const content = trimContent(ai.content_markdown);
  const plain = content.replace(/[#*`>_-]/g, ' ');
  const wordCount = plain.split(/\s+/).filter(Boolean).length;
  const readMinutes = ai.read_minutes || Math.max(1, Math.round(wordCount / 200));

  const record = {
    title: ai.recommended_title,
    slug,
    excerpt: ai.excerpt || '',
    coverImageUrl,
    content,
    contentPlainText: plain.slice(0, 5000),
    category: ai.suggested_category || settings.defaultCategoryFallback || 'General',
    categoryId: plan.defaultCategoryId || undefined,
    tagIds: Array.isArray(plan.defaultTagIds) ? plan.defaultTagIds : [],
    tags: ai.suggested_tags || [],
    author: settings.defaultAuthorName || 'KodeBase Team',
    authorBio: settings.defaultAuthorBio || undefined,
    authorAvatarUrl: settings.defaultAuthorAvatarUrl || undefined,
    readMinutes,
    wordCount,
    postType: idea.contentType || 'blog_post',
    targetKeyword: idea.targetKeyword || undefined,
    secondaryKeywords: idea.secondaryKeywords || [],
    searchIntent: idea.searchIntent || 'informational',
    topicClusterId: plan.topicClusterId || undefined,
    metaTitle: ai.meta_title || `${ai.recommended_title} | KodeBase`,
    metaDescription: ai.meta_description || ai.excerpt || '',
    ogTitle: ai.og_title || ai.meta_title || ai.recommended_title,
    ogDescription: ai.og_description || ai.meta_description || ai.excerpt || '',
    featuredImageAlt: ai.featured_image_alt || ai.recommended_title,
    featuredImagePrompt: ai.featured_image_prompt || undefined,
    published: false,
    aiGenerationInput: JSON.stringify({ topic, target_keyword: idea.targetKeyword }).slice(0, 2000),
    aiModelUsed: 'gpt_5_5',
    lastUpdatedAt: new Date().toISOString(),
  };

  return base44.asServiceRole.entities.BlogPost.create(record);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const {
      content_plan_id,
      planned_indexes = null,
      number_of_posts = null,
      approval_mode = 'require_review',
      generate_images = null,
    } = body || {};

    if (!content_plan_id) return Response.json({ error: 'content_plan_id is required.' }, { status: 400 });

    const planRows = await base44.asServiceRole.entities.BlogContentPlan.filter({ id: content_plan_id });
    const plan = planRows[0];
    if (!plan) return Response.json({ error: 'Content plan not found.' }, { status: 404 });

    const settingsRows = await base44.asServiceRole.entities.BlogSettings.filter({ key: 'global' });
    const settings = settingsRows[0] || {};

    const planned = Array.isArray(plan.plannedPosts) ? [...plan.plannedPosts] : [];
    if (planned.length === 0) return Response.json({ error: 'This plan has no planned posts. Generate the plan first.' }, { status: 400 });

    // Decide which ideas to generate.
    let targets = planned
      .map((idea, index) => ({ idea, index }))
      .filter(({ idea }) => idea.status !== 'created');
    if (Array.isArray(planned_indexes) && planned_indexes.length > 0) {
      const wanted = new Set(planned_indexes);
      targets = targets.filter(({ index }) => wanted.has(index));
    }
    if (number_of_posts && number_of_posts > 0) targets = targets.slice(0, number_of_posts);

    if (targets.length === 0) return Response.json({ error: 'No posts to generate (all selected ideas are already created).' }, { status: 400 });

    // Existing keywords/titles for cannibalization avoidance + internal-link candidates.
    const existingPosts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 500);
    const usedTitles = new Set(existingPosts.map((p) => norm(p.title)).filter(Boolean));
    const usedKeywords = new Set(existingPosts.flatMap((p) => [p.targetKeyword, ...(p.secondaryKeywords || [])]).map(norm).filter(Boolean));
    const linkCandidates = existingPosts
      .filter((p) => p.slug && (p.status === 'published' || p.published))
      .slice(0, 25)
      .map((p) => ({ title: p.title, slug: p.slug }));

    const requireApproval = settings.requireApprovalBeforePublish !== false;
    const doGenerateImages = typeof generate_images === 'boolean' ? generate_images : (plan.generateImages !== false);

    const results = [];
    let createdCount = 0;

    for (const { idea, index } of targets) {
      const titleKey = norm(idea.title);
      const kwKey = norm(idea.targetKeyword);
      if (usedTitles.has(titleKey) || usedKeywords.has(kwKey)) {
        results.push({ index, title: idea.title, skipped: true, reason: 'Duplicate topic or keyword already exists' });
        planned[index] = { ...idea, status: 'skipped_duplicate' };
        continue;
      }

      try {
        const post = await generateOnePost(base44, { idea, plan, settings, linkCandidates, doGenerateImages });

        // Derive scheduled date + status. Never publish immediately.
        const scheduledAt = idea.scheduledDate ? new Date(idea.scheduledDate).toISOString() : undefined;
        let status;
        let approvalStatus;
        if (approval_mode === 'auto_approve' && !requireApproval) {
          approvalStatus = 'approved';
          status = scheduledAt ? 'scheduled' : 'approved';
        } else {
          approvalStatus = 'needs_review';
          status = 'needs_review';
        }

        const updated = await base44.asServiceRole.entities.BlogPost.update(post.id, {
          status,
          approvalStatus,
          scheduledAt,
          published: false,
          approvedBy: approvalStatus === 'approved' ? user.email : undefined,
          approvedAt: approvalStatus === 'approved' ? new Date().toISOString() : undefined,
        });

        usedTitles.add(titleKey);
        usedKeywords.add(kwKey);
        planned[index] = { ...idea, status: 'created', createdPostId: post.id };
        createdCount += 1;
        results.push({ index, title: idea.title, postId: post.id, status, scheduledAt });

        await base44.asServiceRole.entities.BlogAutomationLog.create({
          eventType: 'plan_post_generated',
          relatedPlanId: plan.id,
          relatedPostId: post.id,
          status: 'success',
          message: `Generated "${updated.title}" from plan "${plan.name}" (${status}${scheduledAt ? ', scheduled ' + idea.scheduledDate : ''})`,
          metadata: { contentType: idea.contentType, approvalMode: approval_mode },
        });
      } catch (err) {
        planned[index] = { ...idea, status: 'failed' };
        results.push({ index, title: idea.title, error: err.message });
        await base44.asServiceRole.entities.BlogAutomationLog.create({
          eventType: 'plan_post_generated',
          relatedPlanId: plan.id,
          status: 'error',
          message: `Failed to generate "${idea.title}" from plan "${plan.name}": ${err.message}`,
        });
      }
    }

    // Persist updated planned-post statuses + activate the plan.
    const allCreated = planned.every((i) => i.status === 'created' || i.status === 'skipped_duplicate');
    await base44.asServiceRole.entities.BlogContentPlan.update(plan.id, {
      plannedPosts: planned,
      status: allCreated ? 'completed' : 'active',
    });

    return Response.json({ success: true, generated: createdCount, total_requested: targets.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});