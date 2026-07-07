import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only: suggest 7 fresh blog post ideas that don't duplicate existing posts.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await base44.asServiceRole.entities.BlogPost.list('-created_date', 100);
    const existingTitles = existing.map((p) => p.title).filter(Boolean).slice(0, 80);

    const settingsRows = await base44.asServiceRole.entities.BlogSettings.filter({ key: 'global' });
    const settings = settingsRows[0] || {};

    const ai = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the content strategist for KodeBase (kodebase.us), a developer tool that turns app ideas into build-ready blueprints (data model, roles, security rules, and copy-paste build prompts for Base44 and other AI app builders). Audience: developers, indie hackers, and founders building apps with AI.

Suggest exactly 7 NEW blog post ideas that would attract organic search traffic and drive product interest. Each idea needs: a compelling working title, the primary target keyword, a one-sentence angle explaining why it will perform, and the search intent (informational, commercial, or transactional).

${settings.defaultBrandVoice ? `Brand voice: ${settings.defaultBrandVoice}` : ''}

Do NOT duplicate or closely overlap these existing posts:
${existingTitles.map((t) => `- ${t}`).join('\n')}`,
      response_json_schema: {
        type: 'object',
        properties: {
          ideas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                target_keyword: { type: 'string' },
                angle: { type: 'string' },
                search_intent: { type: 'string' },
              },
              required: ['title', 'target_keyword', 'angle'],
            },
          },
        },
        required: ['ideas'],
      },
    });

    return Response.json({ ideas: (ai.ideas || []).slice(0, 7) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});