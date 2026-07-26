import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const SITE_URL = 'https://kodebase.us';

const SERVICES = `
Services:
- Kode Sessions (${SITE_URL}/services/kode-sessions): 1-on-1 live build sessions.
- ER Service (${SITE_URL}/services/er-service): emergency rescue for broken AI-built apps.
- Security Audit (${SITE_URL}/services/security-audit): full security audit of a Base44 app.
- SEO Audit (${SITE_URL}/services/seo-audit): SEO audit and optimization.
- KodeCare (${SITE_URL}/services/kodecare): ongoing app maintenance and support.
- Base44 BaaS (${SITE_URL}/services/base44-baas): external professional backend architecture.
- Base44 Migration (${SITE_URL}/services/base44-migration): migrate a Base44 app to independent infrastructure.
- Custom App Creation (${SITE_URL}/services/custom-app-creation): custom app builds from $2,000.`;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const products = await base44.asServiceRole.entities.Product.filter({ active: true }, '-updated_date', 25);

    const inventory = `Products for sale:
${products.map((p) => `- ${p.name} ($${((p.priceCents || 0) / 100).toFixed(0)}) [${SITE_URL}/products/${p.slug || ''}]: ${(p.tagline || p.description || '').slice(0, 180)}`).join('\n')}
${SERVICES}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the short-form video strategist for KodeBase (kodebase.us), a premium developer-tool brand for people building apps with AI.

Here is the current inventory of products and services:

${inventory}

Generate EXACTLY 5 diverse short-form social video ideas promoting these offerings. Mix products and services. Each idea must reference a real item above.

For each idea provide:
- title: short internal label (max 6 words)
- description: one sentence on the angle and who it targets
- platform: one of instagram, tiktok, youtube, linkedin, facebook (pick the best fit)
- duration: 4, 6 or 8 (seconds)
- voice: one of river, honey, sunny, storm, spark
- script: the spoken voice-over, written to be read aloud in exactly the chosen duration (roughly 12 words for 4s, 18 for 6s, 24 for 8s). Punchy, hook first, end with a clear call to action mentioning kodebase.us.
- videoDetails: visual direction for the clip — abstract, symbolic, icon-and-shape imagery only, NO text or lettering of any kind in the visuals.`,
      response_json_schema: {
        type: 'object',
        properties: {
          ideas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                platform: { type: 'string' },
                duration: { type: 'number' },
                voice: { type: 'string' },
                script: { type: 'string' },
                videoDetails: { type: 'string' },
              },
              required: ['title', 'script'],
            },
          },
        },
        required: ['ideas'],
      },
    });

    const allowedPlatforms = ['instagram', 'tiktok', 'youtube', 'linkedin', 'facebook'];
    const allowedVoices = ['river', 'honey', 'sunny', 'storm', 'spark'];
    const ideas = (result?.ideas || []).slice(0, 5).map((idea) => ({
      title: idea.title || 'Video idea',
      description: idea.description || '',
      platform: allowedPlatforms.includes(idea.platform) ? idea.platform : 'instagram',
      duration: [4, 6, 8].includes(Number(idea.duration)) ? Number(idea.duration) : 8,
      voice: allowedVoices.includes(idea.voice) ? idea.voice : 'river',
      script: idea.script || '',
      videoDetails: idea.videoDetails || '',
    }));

    return Response.json({ ideas });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}