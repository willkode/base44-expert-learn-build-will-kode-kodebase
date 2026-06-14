import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only AI blog generation engine. Builds a brand/SEO-aware prompt, generates
// a structured article via InvokeLLM, optionally creates a dark-tech featured image,
// saves a BlogPost with status/approval derived from BlogSettings, and logs the event.

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

const LENGTH_GUIDE = {
  short: 'about 600-800 words',
  medium: 'about 1000-1400 words',
  long: 'about 1800-2200 words',
  comprehensive: '2500+ words, in-depth',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      post_type = 'blog_post',
      topic = '',
      target_keyword = '',
      secondary_keywords = [],
      search_intent = 'informational',
      target_audience = '',
      content_goal = '',
      desired_tone = '',
      article_length = '',
      selected_category_id = null,
      selected_tag_ids = [],
      topic_cluster_id = null,
      custom_instructions = '',
      include_featured_image_prompt = true,
      include_faq_section = false,
      include_table_of_contents = false,
      include_meta_fields = true,
      generate_image = true,
      title_options_count = 5,
    } = body || {};

    if (!topic || !String(topic).trim()) {
      return Response.json({ error: 'A topic is required.' }, { status: 400 });
    }

    // Load settings (brand voice, tone, banned/preferred words, status defaults).
    const settingsRows = await base44.asServiceRole.entities.BlogSettings.filter({ key: 'global' });
    const settings = settingsRows[0] || {};

    // Optional cluster context.
    let cluster = null;
    if (topic_cluster_id) {
      const cr = await base44.asServiceRole.entities.BlogTopicCluster.filter({ id: topic_cluster_id });
      cluster = cr[0] || null;
    }

    // Existing published posts for internal-link context (titles + slugs only).
    const allPosts = await base44.asServiceRole.entities.BlogPost.list('-created_date', 50);
    const linkCandidates = allPosts
      .filter((p) => p.slug && (p.status === 'published' || p.published))
      .slice(0, 25)
      .map((p) => ({ title: p.title, slug: p.slug }));

    const tone = desired_tone || settings.defaultArticleTone || 'professional, helpful, authoritative';
    const lengthKey = article_length || settings.defaultArticleLength || 'long';
    const lengthGuide = LENGTH_GUIDE[lengthKey] || LENGTH_GUIDE.long;
    const banned = (settings.bannedWords || []).join(', ');
    const preferred = (settings.preferredWords || []).join(', ');
    const brandVoice = settings.defaultBrandVoice || '';
    const ctaDefault = settings.defaultCta || '';

    const prompt = `You are an expert SEO content writer and editor for KodeBase, a developer tool that turns app ideas into build-ready blueprints (data model, roles, security rules, and copy-paste build prompts for Base44).

Write a complete, original blog article. Post type: ${post_type}. 
Topic: ${topic}
Primary target keyword: ${target_keyword || '(none — infer the best one)'}
Secondary keywords: ${(secondary_keywords || []).join(', ') || '(none)'}
Search intent: ${search_intent}
Target audience: ${target_audience || 'developers and founders building software'}
Content goal: ${content_goal || 'educate and drive product interest'}
Tone: ${tone}
Length: ${lengthGuide}
Brand voice: ${brandVoice || '(use the tone above)'}
${cluster ? `Topic cluster: ${cluster.name} (pillar keyword: ${cluster.pillarKeyword || 'n/a'})` : ''}
Default CTA to weave in (adapt, don't paste verbatim): ${ctaDefault || 'Encourage readers to try KodeBase free.'}
Custom instructions: ${custom_instructions || '(none)'}
Internal link candidates (use ONLY if genuinely relevant, reference by slug): ${JSON.stringify(linkCandidates)}

STRICT WRITING RULES:
- Do NOT invent statistics, testimonials, or unsupported claims.
- Do NOT keyword-stuff; use the target keyword naturally.
- Write for humans first, search engines second. Match the search intent.
- Clear headings (## and ###), short paragraphs, practical examples where useful.
- Strong intro, clear conclusion, exactly ONE main call to action.
- Avoid fluff and generic AI-sounding phrasing.
${banned ? `- Avoid these words/phrases: ${banned}.` : ''}
${preferred ? `- Prefer these words/phrases where natural: ${preferred}.` : ''}
- If the topic touches medical, legal, financial, or other high-risk areas, add a brief compliance disclaimer and note it in quality_warnings.
${include_faq_section ? '- Include a concise FAQ (3-5 Q&A).' : '- Do not include an FAQ.'}
${include_meta_fields ? '- Produce SEO meta fields. Meta title under ~60 chars, meta description ~150 chars and click-worthy.' : ''}
${include_featured_image_prompt ? '- Produce a featured_image_prompt describing a concrete visual subject (no text/logos) and concise featured_image_alt.' : ''}

Provide ${title_options_count} distinct title options and pick the strongest as recommended_title. content_markdown is the full article body in markdown (headings, lists, examples). Suggest one category and 3-6 tags.`;

    const ai = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gpt_5_5',
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title_options: { type: 'array', items: { type: 'string' } },
          recommended_title: { type: 'string' },
          slug: { type: 'string' },
          excerpt: { type: 'string' },
          outline: { type: 'array', items: { type: 'string' } },
          content_markdown: { type: 'string' },
          faq: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' }, answer: { type: 'string' } } } },
          meta_title: { type: 'string' },
          meta_description: { type: 'string' },
          og_title: { type: 'string' },
          og_description: { type: 'string' },
          featured_image_prompt: { type: 'string' },
          featured_image_alt: { type: 'string' },
          suggested_category: { type: 'string' },
          suggested_tags: { type: 'array', items: { type: 'string' } },
          internal_link_suggestions: { type: 'array', items: { type: 'object', properties: { slug: { type: 'string' }, anchor_text: { type: 'string' } } } },
          cta_block: { type: 'string' },
          seo_notes: { type: 'string' },
          quality_warnings: { type: 'array', items: { type: 'string' } },
          read_minutes: { type: 'number' },
        },
        required: ['recommended_title', 'excerpt', 'content_markdown', 'meta_title', 'meta_description'],
      },
    });

    // Unique slug.
    let slug = slugify(ai.slug || ai.recommended_title || topic);
    if (!slug) slug = slugify(topic) || `post-${Date.now()}`;
    const clash = await base44.asServiceRole.entities.BlogPost.filter({ slug });
    if (clash.length > 0) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    // Optional featured image.
    let coverImageUrl = '';
    if (generate_image && include_featured_image_prompt && settings.enableAiImageGeneration !== false) {
      const subject = ai.featured_image_prompt || `${topic} concept`;
      const style = settings.defaultFeaturedImageStyle ||
        'Dark tech aesthetic on a deep navy background (#0d1326 / #0a0f1e). Glowing orange-to-red gradient accents through coral, orange and amber (#f87171 to #fb923c to #facc15). Minimal flat vector style with subtle blueprint grid lines and soft glows. No text, no logos, no watermarks. High contrast, ample negative space, wide 16:9 composition.';
      try {
        const img = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt: `${subject}. ${style}` });
        coverImageUrl = img?.url || '';
      } catch (_e) { /* image is non-blocking */ }
    }

    // Word count + read time.
    const plain = String(ai.content_markdown || '').replace(/[#*`>_-]/g, ' ');
    const wordCount = plain.split(/\s+/).filter(Boolean).length;
    const readMinutes = ai.read_minutes || Math.max(1, Math.round(wordCount / 200));

    // Status + approval derived from settings.
    const requireApproval = settings.requireApprovalBeforePublish !== false;
    const defaultStatus = settings.defaultPostStatus || 'draft';
    const status = requireApproval && defaultStatus === 'published' ? 'needs_review' : defaultStatus;
    const approvalStatus = requireApproval ? 'needs_review' : 'approved';

    const record = {
      title: ai.recommended_title,
      slug,
      excerpt: ai.excerpt || '',
      coverImageUrl,
      content: ai.content_markdown || '',
      contentPlainText: plain.slice(0, 5000),
      category: ai.suggested_category || selected_category_id || settings.defaultCategoryFallback || 'General',
      categoryId: selected_category_id || undefined,
      tagIds: Array.isArray(selected_tag_ids) ? selected_tag_ids : [],
      tags: ai.suggested_tags || [],
      author: settings.defaultAuthorName || 'KodeBase Team',
      authorBio: settings.defaultAuthorBio || undefined,
      authorAvatarUrl: settings.defaultAuthorAvatarUrl || undefined,
      readMinutes,
      wordCount,
      postType: post_type,
      targetKeyword: target_keyword || undefined,
      secondaryKeywords: secondary_keywords || [],
      searchIntent: search_intent,
      topicClusterId: topic_cluster_id || undefined,
      metaTitle: ai.meta_title || `${ai.recommended_title} | KodeBase`,
      metaDescription: ai.meta_description || ai.excerpt || '',
      ogTitle: ai.og_title || ai.meta_title || ai.recommended_title,
      ogDescription: ai.og_description || ai.meta_description || ai.excerpt || '',
      featuredImageAlt: ai.featured_image_alt || ai.recommended_title,
      featuredImagePrompt: ai.featured_image_prompt || undefined,
      status,
      approvalStatus,
      published: false,
      aiGenerationInput: JSON.stringify({ post_type, topic, target_keyword, search_intent, content_goal }).slice(0, 2000),
      aiModelUsed: 'gpt_5_5',
      lastUpdatedAt: new Date().toISOString(),
    };

    const saved = await base44.asServiceRole.entities.BlogPost.create(record);

    await base44.asServiceRole.entities.BlogAutomationLog.create({
      eventType: 'generate',
      relatedPostId: saved.id,
      status: 'success',
      message: `AI generated "${saved.title}" (${wordCount} words) by ${user.email}`,
      metadata: { postType: post_type, status, approvalStatus, slug },
    });

    return Response.json({
      success: true,
      post: saved,
      generated: {
        title_options: ai.title_options || [ai.recommended_title],
        outline: ai.outline || [],
        faq: ai.faq || [],
        internal_link_suggestions: ai.internal_link_suggestions || [],
        cta_block: ai.cta_block || '',
        seo_notes: ai.seo_notes || '',
        quality_warnings: ai.quality_warnings || [],
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});