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
    prompt: (ctx, prev) => `You are the Prompt Engineer Agent. Turn the full architecture into an ORDERED sequence of Base44-ready build prompts the user can paste one-by-one. Also produce an MVP roadmap.

ORDERING RULES:
- The FIRST prompt must be a "Foundation" prompt (design system, layout, routing, auth scaffolding).
- Then proceed in dependency order through these categories as needed: Foundation, Entities, Authentication, Roles and Permissions, Public Pages, User Dashboard, Admin Dashboard, Workflows, Backend Functions, Integrations, Notifications, Security, QA, Polish.
- The "category" field of each prompt MUST be exactly one of those category names.
- The FINAL prompts must be, in this order: a Security review prompt, a QA review prompt, and a UI Polish prompt.

EVERY "promptText" MUST follow this exact markdown structure:
## 1. Context
Explain what has already been built or planned.
## 2. Task
Tell Base44 exactly what to build.
## 3. Requirements
List specific, concrete details (entities, fields, pages, components).
## 4. Safety Rules
- Preserve existing logic
- Do not duplicate pages or entities
- Use existing patterns and components
- Add loading, error, and empty states
- Keep ownership and permissions strict
## 5. Completion Check
Tell Base44 exactly what to verify before finishing.

Set "title" to a short build step name, "purpose" to a one-line goal, and "dependencies" to which earlier prompt numbers must be done first.

Architecture:\n${prev.appArchitecture}\nEntities:\n${prev.entityPlan}\nPermissions:\n${prev.rolePermissionPlan}\nPages:\n${prev.pagePlan}\nWorkflows:\n${prev.workflowPlan}\nBackend:\n${prev.backendFunctionPlan}\n\n${ctx}`,
  },
];

const PLAN_BLUEPRINT_LIMITS = { free: 1, pro: 25, agency: -1 };

function needsMonthlyReset(periodStart) {
  if (!periodStart) return false;
  const start = new Date(periodStart);
  if (isNaN(start.getTime())) return false;
  const now = new Date();
  return (
    now.getUTCFullYear() > start.getUTCFullYear() ||
    (now.getUTCFullYear() === start.getUTCFullYear() && now.getUTCMonth() > start.getUTCMonth())
  );
}

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

// Persist all final records once every agent has produced output.
async function finalize(base44, projectId, project, accumulated, ownerProfile, user) {
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

  if (user.role !== 'admin') {
    const reset = needsMonthlyReset(ownerProfile?.usagePeriodStart);
    const priorUsed = reset ? 0 : (ownerProfile?.blueprintsUsed || 0);
    const usageUpdate = {
      blueprintsUsed: priorUsed + 1,
      usagePeriodStart: ownerProfile?.usagePeriodStart && !reset
        ? ownerProfile.usagePeriodStart
        : new Date().toISOString(),
    };
    if (ownerProfile) {
      await base44.asServiceRole.entities.UserProfile.update(ownerProfile.id, usageUpdate);
    } else {
      await base44.asServiceRole.entities.UserProfile.create({
        userId: project.created_by_id,
        plan: 'free',
        blueprintLimit: 1,
        ...usageUpdate,
      });
    }
  }

  return { blueprint, promptPack, prompts, findings, tests };
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

    // Rebuild progress from existing AgentRun records for this project so this can be
    // called multiple times — each call runs ONE agent to stay under the function timeout.
    const existingRuns = await base44.entities.AgentRun.filter({ projectId }, '-created_date', 100);
    const successByAgent = {};
    for (const r of existingRuns) {
      if (r.status === 'success' && r.outputData && !successByAgent[r.agentName]) {
        successByAgent[r.agentName] = r;
      }
    }

    // Find the next agent that has not completed yet.
    const completedCount = AGENTS.filter((a) => successByAgent[a.name]).length;

    // On the very first step, enforce plan limit and flip status to generating.
    let ownerProfile = (await base44.asServiceRole.entities.UserProfile.filter({ userId: project.created_by_id }, '-created_date', 1))[0] || null;
    if (completedCount === 0) {
      if (user.role !== 'admin') {
        const planId = ownerProfile?.plan || 'free';
        const limit = PLAN_BLUEPRINT_LIMITS[planId] ?? 1;
        let used = ownerProfile?.blueprintsUsed || 0;
        if (needsMonthlyReset(ownerProfile?.usagePeriodStart)) used = 0;
        if (limit !== -1 && used >= limit) {
          return Response.json({
            error: `You've reached your ${planId} plan limit of ${limit} blueprint${limit === 1 ? '' : 's'}. Upgrade your plan to generate more.`,
            code: 'PLAN_LIMIT_REACHED',
            plan: planId,
            limit,
            used,
          }, { status: 403 });
        }
      }
      // Clear any stale runs from a previous failed attempt.
      for (const r of existingRuns) {
        await base44.entities.AgentRun.delete(r.id);
      }
      Object.keys(successByAgent).forEach((k) => delete successByAgent[k]);
      await base44.entities.Project.update(projectId, { status: 'generating' });
    }

    // Reassemble accumulated output from prior successful runs.
    const accumulated = {};
    for (const agent of AGENTS) {
      const run = successByAgent[agent.name];
      if (run?.outputData) {
        try {
          Object.assign(accumulated, JSON.parse(run.outputData));
        } catch (_e) { /* ignore corrupt run */ }
      }
    }

    const context = buildContext(intake, profile, project);
    const nextAgent = AGENTS.find((a) => !successByAgent[a.name]);

    if (nextAgent) {
      const run = await base44.entities.AgentRun.create({
        projectId,
        ownerId: project.created_by_id,
        agentName: nextAgent.name,
        inputSummary: `Generating ${nextAgent.key} for ${project.projectName}`,
        status: 'pending',
      });
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: nextAgent.prompt(context, accumulated),
          response_json_schema: nextAgent.schema,
        });
        Object.assign(accumulated, result);
        await base44.entities.AgentRun.update(run.id, {
          status: 'success',
          outputSummary: `${nextAgent.name} completed`,
          outputData: JSON.stringify(result),
        });
      } catch (agentErr) {
        await base44.entities.AgentRun.update(run.id, {
          status: 'failed',
          errorMessage: String(agentErr?.message || agentErr),
        });
        await base44.entities.Project.update(projectId, { status: 'draft' });
        return Response.json({ error: `${nextAgent.name} failed: ${agentErr?.message || agentErr}` }, { status: 500 });
      }
    }

    const doneCount = AGENTS.filter((a) => a.name === nextAgent?.name || successByAgent[a.name]).length;
    const isComplete = doneCount >= AGENTS.length;

    if (!isComplete) {
      // More agents remain — tell the frontend to call again.
      return Response.json({
        success: true,
        done: false,
        completed: doneCount,
        total: AGENTS.length,
        currentAgent: nextAgent?.name,
      });
    }

    // All agents done — persist everything.
    const { blueprint, promptPack, prompts, findings, tests } = await finalize(
      base44, projectId, project, accumulated, ownerProfile, user
    );

    return Response.json({
      success: true,
      done: true,
      completed: AGENTS.length,
      total: AGENTS.length,
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