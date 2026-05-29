import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Specialized agent roles. Each gets the project context + relevant prior output.
const AGENTS = [
  {
    name: "Base44 Architect Agent",
    key: "appArchitecture",
    schema: {
      type: "object",
      properties: {
        executiveSummary: { type: "string", description: "2-3 paragraph executive summary of the app and architecture approach" },
        appArchitecture: { type: "string", description: "Detailed overall Base44 app architecture in markdown" },
      },
      required: ["executiveSummary", "appArchitecture"],
    },
    prompt: (ctx) => `You are the Base44 Architect Agent. Based on the project intake below, design the overall Base44 application architecture. Cover the high-level structure, major modules, data flow, and how the app fits the Base44 platform (entities, backend functions, integrations, auth).\n\n${ctx}`,
  },
  {
    name: "Entity Architect Agent",
    key: "entities",
    schema: {
      type: "object",
      properties: {
        entityPlan: { type: "string", description: "Markdown describing each entity, its fields, types, and relationships" },
        entities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              purpose: { type: "string" },
              keyFields: { type: "string" },
            },
          },
        },
      },
      required: ["entityPlan", "entities"],
    },
    prompt: (ctx, prev) => `You are the Entity Architect Agent. Design the Base44 entity/data structure. Define every entity, its fields, data types, defaults, and relationships between entities.\n\nApp architecture so far:\n${prev.appArchitecture}\n\n${ctx}`,
  },
  {
    name: "Permissions Agent",
    key: "permissions",
    schema: {
      type: "object",
      properties: {
        rolePermissionPlan: { type: "string", description: "Markdown role-based access model, ownership rules, CRUD recommendations, RLS suggestions" },
        userRoles: {
          type: "array",
          items: {
            type: "object",
            properties: { role: { type: "string" }, description: { type: "string" } },
          },
        },
      },
      required: ["rolePermissionPlan", "userRoles"],
    },
    prompt: (ctx, prev) => `You are the Permissions Agent. Create the role-based access model, ownership rules, per-entity CRUD recommendations, and note any security concerns around permissions. Use the entities defined.\n\nEntities:\n${prev.entityPlan}\n\n${ctx}`,
  },
  {
    name: "Workflow Agent",
    key: "workflows",
    schema: {
      type: "object",
      properties: {
        workflowPlan: { type: "string", description: "Markdown mapping user flows, admin flows, status changes, and automations" },
      },
      required: ["workflowPlan"],
    },
    prompt: (ctx, prev) => `You are the Workflow Agent. Map the key user flows, admin flows, entity status transitions, and recommended automations (entity/scheduled triggers).\n\nArchitecture:\n${prev.appArchitecture}\nPermissions:\n${prev.rolePermissionPlan}\n\n${ctx}`,
  },
  {
    name: "UI/Page Agent",
    key: "pages",
    schema: {
      type: "object",
      properties: {
        pagePlan: { type: "string", description: "Markdown page map: public pages, dashboard layout, admin pages, key components per page" },
      },
      required: ["pagePlan"],
    },
    prompt: (ctx, prev) => `You are the UI/Page Agent. Create the Base44 page map: public marketing pages, authenticated dashboard layout, admin pages, and component recommendations for each page.\n\nWorkflows:\n${prev.workflowPlan}\n\n${ctx}`,
  },
  {
    name: "Backend Function Agent",
    key: "backendFunctions",
    schema: {
      type: "object",
      properties: {
        backendFunctionPlan: { type: "string", description: "Markdown plan of backend functions and AI functions" },
        integrationPlan: { type: "string", description: "Markdown plan of integrations, webhooks, and scheduled logic" },
      },
      required: ["backendFunctionPlan", "integrationPlan"],
    },
    prompt: (ctx, prev) => `You are the Backend Function Agent. Plan all backend functions, AI/LLM functions, third-party integrations, webhooks, and scheduled jobs needed.\n\nArchitecture:\n${prev.appArchitecture}\nWorkflows:\n${prev.workflowPlan}\n\n${ctx}`,
  },
  {
    name: "Security Agent",
    key: "securityReview",
    schema: {
      type: "object",
      properties: {
        securityPlan: { type: "string", description: "Markdown summary of the security review" },
        findings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
              area: { type: "string" },
              issue: { type: "string" },
              risk: { type: "string" },
              recommendation: { type: "string" },
            },
            required: ["severity", "area", "issue", "recommendation"],
          },
        },
      },
      required: ["securityPlan", "findings"],
    },
    prompt: (ctx, prev) => `You are the Security Agent. Review the design for risks: exposed data, weak permissions, missing ownership checks, unsafe backend functions, and admin bypasses. Return concrete findings with severity.\n\nPermissions:\n${prev.rolePermissionPlan}\nBackend functions:\n${prev.backendFunctionPlan}\n\n${ctx}`,
  },
  {
    name: "QA Agent",
    key: "qaChecklist",
    schema: {
      type: "object",
      properties: {
        qaPlan: { type: "string", description: "Markdown summary of the QA approach" },
        tests: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              testName: { type: "string" },
              description: { type: "string" },
              expectedResult: { type: "string" },
            },
            required: ["category", "testName", "expectedResult"],
          },
        },
      },
      required: ["qaPlan", "tests"],
    },
    prompt: (ctx, prev) => `You are the QA Agent. Create testing steps, a launch checklist, edge cases, and regression checks for the app. Return discrete test items.\n\nWorkflows:\n${prev.workflowPlan}\nPages:\n${prev.pagePlan}\n\n${ctx}`,
  },
  {
    name: "Prompt Engineer Agent",
    key: "promptPack",
    schema: {
      type: "object",
      properties: {
        mvpRoadmap: { type: "string", description: "Markdown MVP roadmap with phases" },
        prompts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              promptNumber: { type: "number" },
              title: { type: "string" },
              category: { type: "string" },
              promptText: { type: "string", description: "A complete, copy-paste ready Base44 build prompt" },
              purpose: { type: "string" },
              dependencies: { type: "string" },
            },
            required: ["promptNumber", "title", "promptText"],
          },
        },
      },
      required: ["mvpRoadmap", "prompts"],
    },
    prompt: (ctx, prev) => `You are the Prompt Engineer Agent. Turn the full architecture into an ordered sequence of Base44-ready build prompts a user can paste one-by-one. Each prompt should build one logical piece (entities, pages, functions, etc.) in dependency order. Also produce an MVP roadmap.\n\nEntities:\n${prev.entityPlan}\nPages:\n${prev.pagePlan}\nBackend:\n${prev.backendFunctionPlan}\n\n${ctx}`,
  },
];

function buildContext(intake, profile, project) {
  return `Project context:
- Name: ${project?.projectName || intake?.appName || "Untitled"}
- App type: ${project?.appType || "N/A"}
- Description: ${intake?.appDescription || project?.shortDescription || "N/A"}
- Target audience: ${intake?.targetAudience || project?.targetUsers || "N/A"}
- User roles: ${intake?.userRoles || "N/A"}
- Main features: ${intake?.mainFeatures || "N/A"}
- Admin needs: ${intake?.adminNeeds || "N/A"}
- Integrations needed: ${intake?.integrationsNeeded || "N/A"}
- Payment needs: ${intake?.paymentNeeds || "N/A"}
- AI features needed: ${intake?.aiFeaturesNeeded || "N/A"}
- Security level: ${intake?.securityLevel || "standard"}
- Launch goal: ${intake?.launchGoal || "N/A"}
- Plan tier: ${profile?.plan || "free"}

Return clear, actionable, Base44-specific output.`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, intake, profile } = await req.json();
    if (!projectId) {
      return Response.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Load and authorize the project (owner or admin only)
    let project = null;
    try {
      project = await base44.entities.Project.get(projectId);
    } catch (_e) {
      project = null;
    }
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }
    const isOwner = project.created_by_id === user.id;
    if (!isOwner && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await base44.entities.Project.update(projectId, { status: 'generating' });

    const context = buildContext(intake, profile, project);
    const accumulated = {};

    // Run each specialized agent sequentially, logging an AgentRun per agent.
    for (const agent of AGENTS) {
      const run = await base44.entities.AgentRun.create({
        projectId,
        ownerId: project.created_by_id,
        agentName: agent.name,
        inputSummary: `Generating ${agent.key} for ${project.projectName}`,
        status: 'pending',
      });
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: agent.prompt(context, accumulated),
          response_json_schema: agent.schema,
        });
        Object.assign(accumulated, result);
        await base44.entities.AgentRun.update(run.id, {
          status: 'success',
          outputSummary: `${agent.name} completed`,
        });
      } catch (agentErr) {
        await base44.entities.AgentRun.update(run.id, {
          status: 'failed',
          errorMessage: String(agentErr?.message || agentErr),
        });
        await base44.entities.Project.update(projectId, { status: 'draft' });
        return Response.json({ error: `${agent.name} failed: ${agentErr?.message || agentErr}` }, { status: 500 });
      }
    }

    // Persist Blueprint
    const blueprint = await base44.entities.Blueprint.create({
      projectId,
      ownerId: project.created_by_id,
      title: `${project.projectName} Blueprint`,
      executiveSummary: accumulated.executiveSummary || '',
      appArchitecture: accumulated.appArchitecture || '',
      entityPlan: accumulated.entityPlan || '',
      rolePermissionPlan: accumulated.rolePermissionPlan || '',
      pagePlan: accumulated.pagePlan || '',
      workflowPlan: accumulated.workflowPlan || '',
      backendFunctionPlan: accumulated.backendFunctionPlan || '',
      integrationPlan: accumulated.integrationPlan || '',
      securityPlan: accumulated.securityPlan || '',
      qaPlan: accumulated.qaPlan || '',
      mvpRoadmap: accumulated.mvpRoadmap || '',
      status: 'completed',
    });

    // Persist PromptPack + PromptItems
    const prompts = accumulated.prompts || [];
    const promptPack = await base44.entities.PromptPack.create({
      projectId,
      blueprintId: blueprint.id,
      ownerId: project.created_by_id,
      title: `${project.projectName} Prompt Pack`,
      description: 'Ordered Base44 build prompts generated from the blueprint.',
      totalPrompts: prompts.length,
      status: 'completed',
    });
    if (prompts.length) {
      await base44.entities.PromptItem.bulkCreate(
        prompts.map((p, i) => ({
          promptPackId: promptPack.id,
          projectId,
          ownerId: project.created_by_id,
          promptNumber: p.promptNumber ?? i + 1,
          title: p.title || `Prompt ${i + 1}`,
          category: p.category || 'general',
          promptText: p.promptText || '',
          purpose: p.purpose || '',
          dependencies: p.dependencies || '',
          status: 'not_used',
        }))
      );
    }

    // Persist SecurityFindings
    const findings = accumulated.findings || [];
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
          fixedStatus: 'open',
        }))
      );
    }

    // Persist QAItems
    const tests = accumulated.tests || [];
    if (tests.length) {
      await base44.entities.QAItem.bulkCreate(
        tests.map((t) => ({
          projectId,
          blueprintId: blueprint.id,
          ownerId: project.created_by_id,
          category: t.category || 'general',
          testName: t.testName || '',
          description: t.description || '',
          expectedResult: t.expectedResult || '',
          status: 'pending',
        }))
      );
    }

    await base44.entities.Project.update(projectId, { status: 'completed' });

    return Response.json({
      success: true,
      blueprintId: blueprint.id,
      promptPackId: promptPack.id,
      result: {
        executiveSummary: accumulated.executiveSummary,
        appArchitecture: accumulated.appArchitecture,
        userRoles: accumulated.userRoles,
        entities: accumulated.entities,
        permissions: accumulated.rolePermissionPlan,
        pages: accumulated.pagePlan,
        workflows: accumulated.workflowPlan,
        backendFunctions: accumulated.backendFunctionPlan,
        integrations: accumulated.integrationPlan,
        securityReview: findings,
        qaChecklist: tests,
        mvpRoadmap: accumulated.mvpRoadmap,
        promptPack: prompts,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});