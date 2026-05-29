import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SYSTEM = `You are the Base44 Optimization Agent. Given an app blueprint, produce ready-to-paste prompts the builder can give to Base44 to IMPROVE an existing, already-built app. Focus only on optimization, NOT initial build. Cover these areas:
1. UI Redesign — modernize the look/layout/visual hierarchy of specific pages.
2. Sales Copy — rewrite landing/marketing copy to be more conversion- and sales-focused.
3. SEO — improve titles, meta tags, headings, content structure, internal linking for search visibility.
4. Conversion — improve CTAs, onboarding, signup flow, pricing page to lift conversions.
5. Performance — reduce load, lazy loading, image optimization where relevant.

Each prompt MUST be specific to THIS app (reference its real pages, audience, and purpose), copy-paste-ready, and written as a direct instruction to Base44. Generate 8-12 prompts total, weighted toward UI Redesign, Sales Copy, and SEO.`;

const SCHEMA = {
  type: "object",
  properties: {
    prompts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["UI Redesign", "Sales Copy", "SEO", "Conversion", "Performance"] },
          title: { type: "string" },
          targetArea: { type: "string", description: "Which page or part of the app this targets" },
          purpose: { type: "string", description: "One sentence on what this improves" },
          promptText: { type: "string", description: "Complete copy-paste-ready prompt for Base44" },
        },
        required: ["category", "title", "targetArea", "purpose", "promptText"],
      },
    },
  },
  required: ["prompts"],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await req.json();
    if (!projectId) {
      return Response.json({ error: 'projectId is required' }, { status: 400 });
    }

    let project = null;
    try {
      project = await base44.entities.Project.get(projectId);
    } catch (_e) {
      project = null;
    }
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }
    if (project.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const blueprints = await base44.entities.Blueprint.filter({ projectId }, '-created_date', 1);
    const blueprint = blueprints[0];
    if (!blueprint) {
      return Response.json({ error: 'No blueprint found. Generate a blueprint first.' }, { status: 400 });
    }

    const run = await base44.entities.AgentRun.create({
      projectId,
      ownerId: project.created_by_id,
      agentName: 'Optimization Agent',
      inputSummary: `Optimization prompts for ${project.projectName}`,
      status: 'pending',
    });

    try {
      const prompt = `${SYSTEM}

APP NAME: ${project.projectName}
APP TYPE: ${project.appType || 'N/A'}
DESCRIPTION: ${project.shortDescription || 'N/A'}
TARGET USERS: ${project.targetUsers || 'N/A'}
MONETIZATION: ${project.monetizationModel || 'N/A'}

PAGE PLAN:
${blueprint.pagePlan || 'N/A'}

APP ARCHITECTURE:
${blueprint.appArchitecture || 'N/A'}

EXECUTIVE SUMMARY:
${blueprint.executiveSummary || 'N/A'}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: SCHEMA,
      });

      const prompts = Array.isArray(result.prompts) ? result.prompts : [];

      // Clear previous optimization prompts for this project to avoid duplicates on re-run
      const existing = await base44.entities.OptimizationPrompt.filter({ projectId });
      for (const p of existing) {
        await base44.entities.OptimizationPrompt.delete(p.id);
      }

      if (prompts.length) {
        await base44.entities.OptimizationPrompt.bulkCreate(
          prompts.map((p) => ({
            projectId,
            blueprintId: blueprint.id,
            ownerId: project.created_by_id,
            category: p.category || 'UI Redesign',
            title: p.title || '',
            targetArea: p.targetArea || '',
            purpose: p.purpose || '',
            promptText: p.promptText || '',
            status: 'not_used',
          }))
        );
      }

      await base44.entities.AgentRun.update(run.id, {
        status: 'success',
        outputSummary: `Generated ${prompts.length} optimization prompts.`,
      });

      return Response.json({ success: true, count: prompts.length });
    } catch (agentErr) {
      await base44.entities.AgentRun.update(run.id, {
        status: 'failed',
        errorMessage: String(agentErr?.message || agentErr),
      });
      return Response.json({ error: agentErr?.message || 'Optimization prompt generation failed' }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});