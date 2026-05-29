import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SECURITY_SYSTEM = `You are the Base44 Security Agent — a senior application security reviewer for Base44 (React + Entities + backend functions + role-based auth). Analyze the provided blueprint and produce concrete security findings. Be specific to Base44 (RLS on entities, ownerId checks, role gating, server-side secrets in backend functions). Avoid vague advice.

Check ALL of these areas and produce findings where risks exist:
1. Entity exposure — entities too public, one user seeing another user's records, admin-only entities unprotected.
2. Ownership logic — missing ownerId on user-owned entities, records not filtered by owner, unrestricted update/delete.
3. Role enforcement — unprotected admin features, regular users reaching admin data, unclear staff role separation.
4. Backend function safety — sensitive actions not in backend functions, functions not checking user role, unprotected external API calls.
5. Sensitive data — excessive private user data, unprotected financial/payment records, unsafe uploaded file handling.
6. Multi-tenant risks — users accessing another company/org's data, org/team records not scoped.
7. Audit logging — important/admin actions not logged.`;

const SCHEMA = {
  type: "object",
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          area: { type: "string", description: "One of: Entity Exposure, Ownership Logic, Role Enforcement, Backend Function Safety, Sensitive Data, Multi-tenant, Audit Logging" },
          issue: { type: "string" },
          risk: { type: "string" },
          recommendation: { type: "string" },
          fixPrompt: { type: "string", description: "A complete, copy-paste-ready prompt the user can give to Base44 to fix this specific finding. Written as a direct instruction (e.g. 'Add RLS to the Order entity so each user can only read their own records...'). Be specific to this finding and reference the relevant entities/functions/roles." },
        },
        required: ["severity", "area", "issue", "risk", "recommendation", "fixPrompt"],
      },
    },
  },
  required: ["findings"],
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
      agentName: 'Security Agent',
      inputSummary: `Security review for ${project.projectName}`,
      status: 'pending',
    });

    try {
      const prompt = `${SECURITY_SYSTEM}

Review this Base44 blueprint and return findings.

ENTITIES:
${blueprint.entityPlan || 'N/A'}

ROLES & PERMISSIONS:
${blueprint.rolePermissionPlan || 'N/A'}

BACKEND FUNCTIONS:
${blueprint.backendFunctionPlan || 'N/A'}

INTEGRATIONS:
${blueprint.integrationPlan || 'N/A'}

WORKFLOWS:
${blueprint.workflowPlan || 'N/A'}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: SCHEMA,
      });

      const findings = Array.isArray(result.findings) ? result.findings : [];

      // Clear previous findings for this project to avoid duplicates on re-run
      const existing = await base44.entities.SecurityFinding.filter({ projectId });
      for (const f of existing) {
        await base44.entities.SecurityFinding.delete(f.id);
      }

      if (findings.length) {
        await base44.entities.SecurityFinding.bulkCreate(
          findings.map((f) => ({
            projectId,
            blueprintId: blueprint.id,
            ownerId: project.created_by_id,
            severity: f.severity || 'medium',
            area: f.area || '',
            issue: f.issue || '',
            risk: f.risk || '',
            recommendation: f.recommendation || '',
            fixPrompt: f.fixPrompt || '',
            fixedStatus: 'open',
          }))
        );
      }

      await base44.entities.AgentRun.update(run.id, {
        status: 'success',
        outputSummary: `Security review completed with ${findings.length} findings.`,
      });

      return Response.json({ success: true, count: findings.length });
    } catch (agentErr) {
      await base44.entities.AgentRun.update(run.id, {
        status: 'failed',
        errorMessage: String(agentErr?.message || agentErr),
      });
      return Response.json({ error: agentErr?.message || 'Security review failed' }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});