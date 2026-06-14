import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only. Generates full BlogPost drafts from a content plan's planned-post ideas,
// reusing the generateBlogPost engine for content + SEO + image generation. Assigns
// scheduled dates, sets status to draft/needs_review/approved/scheduled ONLY (never
// publishes immediately), respects the approval workflow, de-dupes topics/keywords,
// logs every step, and marks the plan's ideas as created.

function norm(s) {
  return String(s || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const {
      content_plan_id,
      planned_indexes = null, // optional array of idea indexes to generate; null = all not-yet-created
      number_of_posts = null,
      date_range_start = '',
      date_range_end = '',
      approval_mode = 'require_review', // require_review | auto_approve
      generate_images = null, // overrides plan setting when boolean
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

    // Existing keywords/titles for cannibalization avoidance.
    const existingPosts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 500);
    const usedTitles = new Set(existingPosts.map((p) => norm(p.title)).filter(Boolean));
    const usedKeywords = new Set(existingPosts.flatMap((p) => [p.targetKeyword, ...(p.secondaryKeywords || [])]).map(norm).filter(Boolean));

    const requireApproval = settings.requireApprovalBeforePublish !== false;
    const doGenerateImages = typeof generate_images === 'boolean' ? generate_images : (plan.generateImages !== false);

    const results = [];
    let createdCount = 0;

    for (const { idea, index } of targets) {
      const titleKey = norm(idea.title);
      const kwKey = norm(idea.targetKeyword);
      // Skip true duplicates (already a live post with same title/keyword).
      if (usedTitles.has(titleKey) || usedKeywords.has(kwKey)) {
        results.push({ index, title: idea.title, skipped: true, reason: 'Duplicate topic or keyword already exists' });
        planned[index] = { ...idea, status: 'skipped_duplicate' };
        continue;
      }

      try {
        const gen = await base44.asServiceRole.functions.invoke('generateBlogPost', {
          post_type: idea.contentType || 'blog_post',
          topic: idea.angle ? `${idea.title} — ${idea.angle}` : idea.title,
          target_keyword: idea.targetKeyword || '',
          secondary_keywords: idea.secondaryKeywords || [],
          search_intent: idea.searchIntent || 'informational',
          target_audience: plan.targetAudience || '',
          content_goal: plan.goal || '',
          desired_tone: plan.desiredTone || '',
          article_length: plan.articleLength || 'long',
          selected_category_id: plan.defaultCategoryId || null,
          selected_tag_ids: plan.defaultTagIds || [],
          topic_cluster_id: plan.topicClusterId || null,
          custom_instructions: plan.customInstructions || '',
          generate_image: doGenerateImages,
        });

        const post = gen?.data?.post;
        if (!post) throw new Error(gen?.data?.error || 'Generation returned no post');

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