import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Prompt Engine — discovery chat orchestrator.
// Maintains a multi-category app blueprint by chatting with the user.
// The model returns a JSON STRING for the blueprint (avoids strict-mode
// nested-object schema rejections) plus the next batch of questions.

const SCHEMA = {
  type: 'object',
  properties: {
    reply: {
      type: 'string',
      description: 'Conversational reply to the user. Briefly restate what you understood, then ask 3-5 of the most important MISSING questions grouped by category. Use markdown. If the blueprint is detailed enough to build, say so and tell the user they can review and generate.',
    },
    blueprint_json: {
      type: 'string',
      description: 'A JSON STRING of the full app blueprint object so far. Keys: app_name, app_type, target_users, problem_solved, primary_outcome, roles (array of {name, can_see, can_create, can_edit, can_delete, never_access}), pages (array of {name, purpose, access, main_actions}), features (array of {name, purpose, user_actions, permission_rules}), entities (array of {name, fields, relationships, owner_field, status_values}), workflows (array of {name, trigger, steps, roles_involved}), integrations (array), ai_features (array), admin_tools (array of strings), security_rules (array of strings), monetization (string), assumptions (array of strings), missing_items (array of strings), recommended_build_order (array of strings). Merge new info with what was provided. Return valid JSON only.',
    },
    completion_score: {
      type: 'number',
      description: '0-100 estimate of how complete/buildable the blueprint is.',
    },
    ready_to_compile: {
      type: 'boolean',
      description: 'True only when there is enough detail across roles, entities, pages, features and permissions to generate a real build.',
    },
    app_name: { type: 'string', description: 'Best current guess at the app name.' },
  },
  required: ['reply', 'blueprint_json', 'completion_score', 'ready_to_compile'],
};

function safeParse(jsonStr) {
  if (!jsonStr || typeof jsonStr !== 'string') return {};
  try { return JSON.parse(jsonStr); } catch (_e) { /* fall through */ }
  const match = jsonStr.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch (_e2) { /* ignore */ } }
  return {};
}

function arr(v) { return Array.isArray(v) ? v : []; }

function buildPrompt(idea, history, currentBlueprint) {
  return `You are an expert software product architect running a discovery interview for "Base44 Prompt Engine".
Your job: turn a rough app idea into a precise, buildable blueprint by asking smart, grouped questions.

RULES:
- Ask 3-5 questions MAX per turn, grouped by category (Roles, Data/Entities, Pages, Features, Permissions, Integrations, Monetization).
- Always prioritize the MOST important missing information first (roles & permissions, then data, then features).
- Make reasonable assumptions for trivial details and record them in "assumptions" rather than asking.
- Keep merging answers into the blueprint — never drop previously gathered detail.
- Be concise and friendly.

ORIGINAL IDEA:
${idea || '(none yet)'}

CONVERSATION SO FAR:
${history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n') || '(none)'}

CURRENT BLUEPRINT (JSON, merge into this):
${JSON.stringify(currentBlueprint || {})}

Return your conversational reply plus the updated blueprint JSON string, a completion score, and whether it is ready to compile.`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sessionId, userMessage } = await req.json();
    if (!sessionId || !userMessage) {
      return Response.json({ error: 'sessionId and userMessage are required.' }, { status: 400 });
    }

    const sessions = await base44.entities.PromptGeneratorSession.filter({ id: sessionId });
    const session = sessions[0];
    if (!session) return Response.json({ error: 'Session not found.' }, { status: 404 });

    // Load history + current blueprint.
    const messages = await base44.entities.PromptGeneratorMessage.filter({ session_id: sessionId }, 'order_index');
    const blueprints = await base44.entities.AppBlueprint.filter({ session_id: sessionId }, '-created_date', 1);
    const blueprint = blueprints[0] || null;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const nextIndex = messages.length;

    // Persist the user's message.
    await base44.entities.PromptGeneratorMessage.create({
      session_id: sessionId,
      user_id: user.id,
      role: 'user',
      content: userMessage,
      message_type: 'answer',
      order_index: nextIndex,
    });

    const currentBlueprint = blueprint
      ? {
          app_name: blueprint.app_name, app_type: blueprint.app_type, target_users: blueprint.target_users,
          problem_solved: blueprint.problem_solved, primary_outcome: blueprint.primary_outcome,
          roles: blueprint.roles, pages: blueprint.pages, features: blueprint.features,
          entities: blueprint.entities, workflows: blueprint.workflows, integrations: blueprint.integrations,
          ai_features: blueprint.ai_features, admin_tools: blueprint.admin_tools,
          security_rules: blueprint.security_rules, monetization: blueprint.monetization,
          assumptions: blueprint.assumptions, missing_items: blueprint.missing_items,
          recommended_build_order: blueprint.recommended_build_order,
        }
      : {};

    const raw = await base44.integrations.Core.InvokeLLM({
      prompt: buildPrompt(session.raw_idea || userMessage, [...history, { role: 'user', content: userMessage }], currentBlueprint),
      response_json_schema: SCHEMA,
      model: 'gpt_5_5',
    });

    const parsed = safeParse(raw.blueprint_json);
    const completionScore = Math.max(0, Math.min(100, Math.round(raw.completion_score || 0)));
    const readyToCompile = !!raw.ready_to_compile;
    const appName = raw.app_name || parsed.app_name || session.app_name || '';

    // Persist assistant reply.
    const replyMsg = await base44.entities.PromptGeneratorMessage.create({
      session_id: sessionId,
      user_id: user.id,
      role: 'assistant',
      content: raw.reply || 'Tell me more about your app.',
      message_type: readyToCompile ? 'summary' : 'question',
      order_index: nextIndex + 1,
    });

    // Upsert blueprint.
    const blueprintData = {
      session_id: sessionId,
      user_id: user.id,
      app_name: parsed.app_name || appName || undefined,
      app_type: parsed.app_type || undefined,
      target_users: parsed.target_users || undefined,
      problem_solved: parsed.problem_solved || undefined,
      primary_outcome: parsed.primary_outcome || undefined,
      roles: arr(parsed.roles),
      pages: arr(parsed.pages),
      features: arr(parsed.features),
      entities: arr(parsed.entities),
      workflows: arr(parsed.workflows),
      integrations: arr(parsed.integrations),
      ai_features: arr(parsed.ai_features),
      admin_tools: arr(parsed.admin_tools),
      security_rules: arr(parsed.security_rules),
      monetization: parsed.monetization || undefined,
      assumptions: arr(parsed.assumptions),
      missing_items: arr(parsed.missing_items),
      recommended_build_order: arr(parsed.recommended_build_order),
      confidence_score: completionScore,
    };
    if (blueprint) {
      await base44.entities.AppBlueprint.update(blueprint.id, blueprintData);
    } else {
      await base44.entities.AppBlueprint.create(blueprintData);
    }

    // Update session.
    await base44.entities.PromptGeneratorSession.update(sessionId, {
      app_name: appName || session.app_name,
      completion_score: completionScore,
      blueprint_status: readyToCompile ? 'ready' : 'in_progress',
      current_stage: readyToCompile ? 'blueprint_ready' : 'discovery',
    });

    return Response.json({
      success: true,
      reply: replyMsg,
      readyToCompile,
      completionScore,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});