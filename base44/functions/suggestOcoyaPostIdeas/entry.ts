import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const STATIC_OFFERINGS = `
Tools (free/paid tools on the site):
- Blueprint Tool (/tools/blueprint): AI discovery chat that turns an app idea into a structured application blueprint.
- Prompt Engine (/tools/prompt-engine): Generates a full ordered prompt pack (build, QA, security, polish prompts) from an approved blueprint.
- Prompt Generator (/tools/prompt-generator): Quick AI prompt generation tool.
- Prompt Vault (/vault): One-time lifetime purchase library of premium Base44 prompts.
- Pro Membership (/pro): Monthly membership with prompt pack unlocks, monthly 1-hour calls, and more.

Services:
- Kode Sessions (/services/kode-sessions): 1-on-1 live build sessions.
- ER Service (/services/er-service): Emergency rescue service for broken AI-built apps.
- Security Audit (/services/security-audit): Full security audit of a Base44 app.
- SEO Audit (/services/seo-audit): SEO audit and optimization service.

Learn hub also includes: AI Controls prompt repository, Agent Skills library, LLM Guide, and video tutorials.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const svc = base44.asServiceRole.entities;
    const [products, posts, skills, videos] = await Promise.all([
      svc.Product.filter({ active: true }, '-updated_date', 30),
      svc.BlogPost.filter({ status: 'published' }, '-publishedAt', 15),
      svc.AgentSkill.filter({ published: true }, '-updated_date', 20),
      svc.Video.list('-updated_date', 10),
    ]);

    const inventory = `
Products for sale:
${products.map((p) => `- ${p.name} ($${(p.priceCents / 100).toFixed(0)}): ${p.tagline || p.description || ''}`.slice(0, 200)).join('\n')}

Recent blog posts:
${posts.map((p) => `- ${p.title}: ${p.excerpt || ''}`.slice(0, 180)).join('\n')}

Agent skills (free prompt library items):
${skills.slice(0, 15).map((s) => `- ${s.title}`).join('\n')}

Videos:
${videos.slice(0, 10).map((v) => `- ${v.title || v.name || ''}`).join('\n')}

${STATIC_OFFERINGS}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the social media strategist for KodeBase, a premium developer-tool brand for people building apps with AI (vibe coders). Below is the current inventory of everything on the site — products, tools, services, blog posts, and free resources.

${inventory}

Generate EXACTLY 7 diverse social media post ideas promoting this content. Mix it up: some product promos, some value/educational posts pulling from blog topics or free resources, some tool/service spotlights. Each idea must reference real items from the inventory above.

For each idea provide:
- title: short catchy internal label (max 8 words)
- description: one sentence explaining the angle
- instructions: a detailed brief (2-4 sentences) that a copywriter can use to write the post — include the specific item(s) being promoted, the angle, the target audience, and the call to action.`,
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
                instructions: { type: 'string' },
              },
              required: ['title', 'description', 'instructions'],
            },
          },
        },
        required: ['ideas'],
      },
    });

    return Response.json({ ideas: (result.ideas || []).slice(0, 7) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});