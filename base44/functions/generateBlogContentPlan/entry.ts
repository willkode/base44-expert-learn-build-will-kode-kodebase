import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only. Takes plan settings, generates a strategic list of blog post ideas via
// InvokeLLM (each with target keyword, search intent, content type, suggested category/tags
// and a suggested publish date), de-dupes topics/keywords against existing posts and each
// other, saves/updates a BlogContentPlan, and logs the event. Does NOT create BlogPost
// records here — that is handled by generateAndScheduleBlogPostsFromPlan.

function norm(s) {
  return String(s || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmt(d) {
  return new Date(d).toISOString().slice(0, 10);
}

// Map a publishing frequency to an interval in days.
const FREQ_DAYS = {
  daily: 1,
  twice_weekly: 3,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const {
      plan_id = null,
      name = '',
      goal = 'traffic',
      target_audience = '',
      topic_cluster_id = null,
      keywords = [],
      content_types = [],
      start_date = '',
      end_date = '',
      frequency = 'weekly',
      default_category_id = null,
      default_tag_ids = [],
      desired_tone = '',
      article_length = 'long',
      require_approval = true,
      generate_images = true,
      custom_instructions = '',
      idea_count = 0,
    } = body || {};

    if (!name || !String(name).trim()) return Response.json({ error: 'A plan name is required.' }, { status: 400 });

    const settingsRows = await base44.asServiceRole.entities.BlogSettings.filter({ key: 'global' });
    const settings = settingsRows[0] || {};

    let cluster = null;
    if (topic_cluster_id) {
      const cr = await base44.asServiceRole.entities.BlogTopicCluster.filter({ id: topic_cluster_id });
      cluster = cr[0] || null;
    }

    // Existing topics + keywords to avoid duplication / cannibalization.
    const existingPosts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 500);
    const usedTitles = existingPosts.map((p) => norm(p.title)).filter(Boolean);
    const usedKeywords = new Set(
      existingPosts.flatMap((p) => [p.targetKeyword, ...(p.secondaryKeywords || [])]).map(norm).filter(Boolean)
    );

    // Determine how many ideas to generate from the date range + frequency, unless explicitly set.
    const intervalDays = FREQ_DAYS[frequency] || 7;
    let count = idea_count;
    if (!count || count < 1) {
      if (start_date && end_date) {
        const span = Math.max(1, Math.round((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)));
        count = Math.min(40, Math.max(3, Math.ceil(span / intervalDays) + 1));
      } else {
        count = 10;
      }
    }
    count = Math.min(count, 40);

    const tone = desired_tone || settings.defaultArticleTone || 'professional, helpful, authoritative';
    const contentTypesList = (content_types || []).join(', ') || 'pillar_page, guide, listicle, comparison, how-to';

    const prompt = `You are an SEO content strategist for KodeBase, a developer tool that turns app ideas into build-ready blueprints (data model, roles, security rules, copy-paste build prompts for Base44).

Build a strategic editorial plan as a list of ${count} distinct blog post ideas.

Plan goal: ${goal}
Target audience: ${target_audience || 'developers and founders building software'}
Primary keywords to cover: ${(keywords || []).join(', ') || '(infer the best ones for the goal)'}
Allowed content types (choose from these): ${contentTypesList}
Tone: ${tone}
${cluster ? `Topic cluster: ${cluster.name} (pillar keyword: ${cluster.pillarKeyword || 'n/a'}). Build a cluster: ONE pillar_page covering the pillar keyword, the rest as supporting posts.` : ''}
Custom instructions: ${custom_instructions || '(none)'}

CRITICAL RULES:
- Every idea must target a DISTINCT primary keyword. Do NOT cannibalize keywords.
- Avoid these already-used titles: ${usedTitles.slice(0, 60).join(' | ') || '(none)'}
- Avoid these already-targeted keywords: ${[...usedKeywords].slice(0, 60).join(', ') || '(none)'}
- Match each idea's content_type to the most appropriate format and assign the correct search_intent.
- Provide a click-worthy working title, a one-sentence angle, 2-4 secondary keywords, and 2-4 suggested tags per idea.
- Order ideas strategically (pillar first if a cluster, then supporting posts by priority).`;

    const ai = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gpt_5_5',
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          strategy_summary: { type: 'string' },
          ideas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                angle: { type: 'string' },
                target_keyword: { type: 'string' },
                secondary_keywords: { type: 'array', items: { type: 'string' } },
                search_intent: { type: 'string', enum: ['informational', 'commercial', 'transactional', 'navigational', 'local'] },
                content_type: { type: 'string' },
                suggested_category: { type: 'string' },
                suggested_tags: { type: 'array', items: { type: 'string' } },
                priority: { type: 'string', enum: ['low', 'medium', 'high'] },
              },
              required: ['title', 'target_keyword', 'content_type'],
            },
          },
        },
        required: ['ideas'],
      },
    });

    // De-dupe ideas against existing + each other (topic + keyword), assign publish dates.
    const seenTitles = new Set(usedTitles);
    const seenKeywords = new Set(usedKeywords);
    let cursor = start_date ? new Date(start_date) : addDays(new Date(), intervalDays);
    const endBound = end_date ? new Date(end_date) : null;

    const ideas = [];
    for (const raw of ai.ideas || []) {
      const t = norm(raw.title);
      const k = norm(raw.target_keyword);
      if (!t || !k) continue;
      if (seenTitles.has(t) || seenKeywords.has(k)) continue;
      seenTitles.add(t);
      seenKeywords.add(k);

      const publishDate = fmt(cursor);
      ideas.push({
        title: raw.title,
        angle: raw.angle || '',
        targetKeyword: raw.target_keyword,
        secondaryKeywords: raw.secondary_keywords || [],
        searchIntent: raw.search_intent || 'informational',
        contentType: raw.content_type || 'blog_post',
        suggestedCategory: raw.suggested_category || '',
        suggestedTags: raw.suggested_tags || [],
        priority: raw.priority || 'medium',
        scheduledDate: publishDate,
        status: 'idea',
      });

      cursor = addDays(cursor, intervalDays);
      if (endBound && cursor > endBound) cursor = endBound;
    }

    // Build the plan record.
    const planRecord = {
      name: name.trim(),
      goal,
      targetAudience: target_audience || undefined,
      topicClusterId: topic_cluster_id || undefined,
      keywords: keywords || [],
      contentMix: (content_types || []).reduce((acc, t) => { acc[t] = (acc[t] || 0) + ideas.filter((i) => i.contentType === t).length; return acc; }, {}),
      startDate: start_date || undefined,
      endDate: end_date || undefined,
      frequency,
      defaultCategoryId: default_category_id || undefined,
      defaultTagIds: default_tag_ids || [],
      desiredTone: desired_tone || undefined,
      articleLength: article_length,
      requireApproval: require_approval !== false,
      generateImages: generate_images !== false,
      customInstructions: custom_instructions || undefined,
      strategySummary: ai.strategy_summary || '',
      plannedPosts: ideas,
      status: 'draft',
    };

    let saved;
    if (plan_id) {
      saved = await base44.asServiceRole.entities.BlogContentPlan.update(plan_id, planRecord);
    } else {
      saved = await base44.asServiceRole.entities.BlogContentPlan.create(planRecord);
    }

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'content_plan_generate',
      relatedPlanId: saved.id,
      status: 'success',
      message: `Generated content plan "${saved.name}" with ${ideas.length} post idea(s) by ${user.email}`,
      metadata: { ideas: ideas.length, goal, frequency },
    });

    return Response.json({ success: true, plan: saved, ideas, strategy_summary: ai.strategy_summary || '' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});