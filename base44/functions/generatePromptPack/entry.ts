import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Prompt Engine — prompt pack generator.
// Takes an approved blueprint and produces an ordered set of copy-paste-ready
// build prompts plus QA and security prompts. The model returns ONE JSON STRING
// (avoids strict-mode nested schema rejection). Prompt bodies are stored
// server-side; they are only returned to the client once the session is unlocked.

const SCHEMA = {
  type: 'object',
  properties: {
    prompts_json: {
      type: 'string',
      description: 'A JSON STRING of an object with three arrays: "build_prompts", "qa_prompts", "security_prompts". Each prompt object has: order_number (number), title (string), category (string), objective (string), prompt_body (string, full markdown), acceptance_criteria (string), dependencies (string), estimated_complexity ("low"|"medium"|"high"). build_prompts MUST be ordered foundation-first: first item category "Foundation", last item category "Polish". Data/entities come before workflows; permissions early. Return valid JSON only.',
    },
  },
  required: ['prompts_json'],
};

function safeParse(jsonStr) {
  if (!jsonStr || typeof jsonStr !== 'string') return {};
  try { return JSON.parse(jsonStr); } catch (_e) { /* fall through */ }
  const match = jsonStr.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch (_e2) { /* ignore */ } }
  return {};
}

function arr(v) { return Array.isArray(v) ? v : []; }

function buildPrompt(blueprint) {
  return `You are an expert Base44 prompt engineer. Turn the app blueprint below into an ORDERED pack of production-grade prompts a builder will paste into Base44 one at a time.

STRICT ORDERING for build_prompts (foundation-first):
1. Foundation (project setup, layout, routing, design system)
2. Data / Entities (all entities with fields, relationships, owner fields, status values)
3. Roles & Permissions (RLS, route protection) — early
4. Authentication & core user journey
5. Features (one cohesive feature per prompt)
6. Admin dashboard & tools
7. Integrations
8. Polish (final pass) — LAST build prompt

Then provide qa_prompts (testing checklists/flows) and security_prompts (RLS audit, admin protection, private-data checks).

EVERY prompt_body MUST:
- Be copy-paste ready and self-contained, written as an instruction to the Base44 AI.
- Include a clear objective, the exact entities/pages/fields involved, and acceptance criteria.
- Include this exact warning line near the end: "Do not remove or change existing functionality not mentioned in this prompt."
- State its dependencies (what must exist first) and an estimated_complexity.

APP BLUEPRINT (JSON):
${JSON.stringify(blueprint)}

Return a single JSON string under "prompts_json".`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sessionId } = await req.json();
    if (!sessionId) return Response.json({ error: 'sessionId is required.' }, { status: 400 });

    const sessions = await base44.entities.PromptGeneratorSession.filter({ id: sessionId });
    const session = sessions[0];
    if (!session) return Response.json({ error: 'Session not found.' }, { status: 404 });

    const blueprints = await base44.entities.AppBlueprint.filter({ session_id: sessionId }, '-created_date', 1);
    const blueprint = blueprints[0];
    if (!blueprint) return Response.json({ error: 'No blueprint found for this session.' }, { status: 400 });

    await base44.entities.PromptGeneratorSession.update(sessionId, { current_stage: 'generating', blueprint_status: 'approved' });
    await base44.entities.AppBlueprint.update(blueprint.id, { approved_by_user: true });

    let result;
    try {
      const raw = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(blueprint),
        response_json_schema: SCHEMA,
        model: 'gpt_5_5',
      });
      result = safeParse(raw.prompts_json);
    } catch (genErr) {
      await base44.entities.PromptGeneratorSession.update(sessionId, { current_stage: 'approved' });
      return Response.json({ error: `Generation failed: ${genErr.message}` }, { status: 502 });
    }

    // Clear any prior prompts for this session (regeneration safety).
    const prior = await base44.entities.GeneratedPrompt.filter({ session_id: sessionId });
    for (const p of prior) {
      await base44.entities.GeneratedPrompt.delete(p.id);
    }

    const groups = [
      { key: 'build_prompts', group: 'build' },
      { key: 'qa_prompts', group: 'qa' },
      { key: 'security_prompts', group: 'security' },
    ];

    let total = 0;
    let order = 1;
    for (const { key, group } of groups) {
      const list = arr(result[key]);
      for (const p of list) {
        await base44.entities.GeneratedPrompt.create({
          session_id: sessionId,
          blueprint_id: blueprint.id,
          user_id: user.id,
          order_number: p.order_number || order,
          title: p.title || `${group} prompt ${order}`,
          category: p.category || (group === 'build' ? 'Feature' : group.toUpperCase()),
          prompt_group: group,
          objective: p.objective || '',
          prompt_body: p.prompt_body || '',
          acceptance_criteria: p.acceptance_criteria || '',
          dependencies: p.dependencies || '',
          estimated_complexity: ['low', 'medium', 'high'].includes(p.estimated_complexity) ? p.estimated_complexity : 'medium',
        });
        total += 1;
        order += 1;
      }
    }

    await base44.entities.PromptGeneratorSession.update(sessionId, {
      current_stage: 'prompts_ready',
      generated_prompt_count: total,
    });

    return Response.json({ success: true, totalPrompts: total });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});