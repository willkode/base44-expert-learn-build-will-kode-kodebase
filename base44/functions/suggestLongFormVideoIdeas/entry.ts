import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const SERVICES = [
  'Base44 Migration (move a Base44 app to independent infrastructure)',
  'Custom App Creation (bespoke Base44 apps from $2,000)',
  'Security Audit, SEO Audit, ER Service (emergency fixes), KodeCare maintenance',
  'Kode Sessions (1:1 coaching), Base44 BaaS consulting',
  'Prompt Engine (AI blueprint + ordered prompt packs), Prompt Vault, Agent Skills',
];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const products = await base44.asServiceRole.entities.Product.filter({ active: true }, '-order', 20);
    const productList = products.map((p) => `- ${p.name}: ${p.tagline || p.description || ''}`).join('\n');

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the content strategist for KodeBase (kodebase.us), a Base44 / vibe-coding tools and services brand.

Services:
${SERVICES.map((s) => `- ${s}`).join('\n')}

Products:
${productList}

Propose 5 DIFFERENT long-form narrated video projects (20 to 60 seconds each, built from multiple 8-second AI scenes).

For each idea return:
- title: short internal project title (3-7 words)
- brief: 2-4 sentences describing the video's story, angle and outcome for the viewer. This becomes the input for script generation, so make it concrete and specific about the offer being promoted.
- platform: one of tiktok, instagram, youtube, linkedin, facebook
- target_duration: one of 20, 30, 45, 60 (seconds)
- style_notes: a short visual direction line (palette, lighting, camera language). Never mention text, lettering, numbers or logos — the video model must render zero text.

Vary the angles: pain point, transformation story, behind the scenes, comparison, and a direct offer pitch.`,
      response_json_schema: {
        type: 'object',
        properties: {
          ideas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                brief: { type: 'string' },
                platform: { type: 'string' },
                target_duration: { type: 'number' },
                style_notes: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const platforms = ['tiktok', 'instagram', 'youtube', 'linkedin', 'facebook'];
    const durations = [20, 30, 45, 60];
    const ideas = (result?.ideas || []).slice(0, 5).map((i) => ({
      title: i.title || 'Untitled video',
      brief: i.brief || '',
      platform: platforms.includes(i.platform) ? i.platform : 'tiktok',
      target_duration: durations.includes(Number(i.target_duration)) ? Number(i.target_duration) : 30,
      style_notes: i.style_notes || '',
    }));

    return Response.json({ ideas });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}