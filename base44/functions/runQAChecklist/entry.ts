import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORIES = [
  "Authentication", "User roles", "Entity permissions", "Forms", "Dashboard",
  "Admin tools", "Backend functions", "Integrations", "Notifications",
  "Mobile responsiveness", "Error handling", "Empty states", "Security", "Launch readiness",
];

const QA_SYSTEM = `You are the Base44 QA Agent — a senior QA engineer for Base44 apps (React + Entities + backend functions + role-based auth). Analyze the provided blueprint and produce a concrete, app-specific QA checklist before launch.

Produce test items for EACH of these categories (multiple items where relevant):
${CATEGORIES.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Each test must be specific to THIS app's blueprint, not generic. Cover real flows, role boundaries, ownership, edge cases, and launch readiness. Write clear, verifiable expected results.

For EACH test item, also write an "auditPrompt": a complete, copy-paste-ready Base44 prompt the user can paste to audit/verify that specific task, referencing the relevant pages/entities/functions.`;

const SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: CATEGORIES },
          testName: { type: "string" },
          description: { type: "string" },
          expectedResult: { type: "string" },
          auditPrompt: { type: "string" },
        },
        required: ["category", "testName", "description", "expectedResult", "auditPrompt"],
      },
    },
  },
  required: ["items"],
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
      agentName: 'QA Agent',
      inputSummary: `QA checklist for ${project.projectName}`,
      status: 'pending',
    });

    try {
      const prompt = `${QA_SYSTEM}

Build the QA checklist for this Base44 blueprint.

APP: ${project.projectName} — ${project.shortDescription || ''}

ENTITIES:
${blueprint.entityPlan || 'N/A'}

ROLES & PERMISSIONS:
${blueprint.rolePermissionPlan || 'N/A'}

PAGES:
${blueprint.pagePlan || 'N/A'}

WORKFLOWS:
${blueprint.workflowPlan || 'N/A'}

BACKEND FUNCTIONS:
${blueprint.backendFunctionPlan || 'N/A'}

INTEGRATIONS:
${blueprint.integrationPlan || 'N/A'}

SECURITY:
${blueprint.securityPlan || 'N/A'}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: SCHEMA,
      });

      const items = Array.isArray(result.items) ? result.items : [];

      // Clear previous items for this project to avoid duplicates on re-run
      const existing = await base44.entities.QAItem.filter({ projectId });
      for (const it of existing) {
        await base44.entities.QAItem.delete(it.id);
      }

      if (items.length) {
        await base44.entities.QAItem.bulkCreate(
          items.map((it) => ({
            projectId,
            blueprintId: blueprint.id,
            ownerId: project.created_by_id,
            category: it.category || 'Launch readiness',
            testName: it.testName || '',
            description: it.description || '',
            expectedResult: it.expectedResult || '',
            auditPrompt: it.auditPrompt || '',
            status: 'pending',
            notes: '',
          }))
        );
      }

      await base44.entities.AgentRun.update(run.id, {
        status: 'success',
        outputSummary: `QA checklist generated with ${items.length} tests.`,
      });

      return Response.json({ success: true, count: items.length });
    } catch (agentErr) {
      await base44.entities.AgentRun.update(run.id, {
        status: 'failed',
        errorMessage: String(agentErr?.message || agentErr),
      });
      return Response.json({ error: agentErr?.message || 'QA checklist failed' }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});