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
              fixPrompt: { type: "string", description: "A complete, copy-paste-ready prompt the user can give to Base44 to fix this specific finding. Written as a direct instruction referencing the relevant entities/functions/roles." },
            },
            required: ["severity", "area", "issue", "recommendation", "fixPrompt"],
          },
        },
      },
      required: ["securityPlan", "findings"],
    },
    prompt: (ctx, prev) => `You are the Security Agent. Review the design for risks: exposed data, weak permissions, missing ownership checks, unsafe backend functions, and admin bypasses. Return UP TO 12 concrete findings with severity. For EACH finding, also write a "fixPrompt": a complete, copy-paste-ready Base44 prompt the user can paste to fix that specific issue.\n\nPermissions:\n${prev.rolePermissionPlan}\nBackend functions:\n${prev.backendFunctionPlan}\n\n${ctx}`,
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
              auditPrompt: { type: "string", description: "A complete, copy-paste-ready Base44 prompt the user can paste to audit/verify this specific QA task, referencing the relevant pages/entities/functions." },
            },
            required: ["category", "testName", "expectedResult", "auditPrompt"],
          },
        },
      },
      required: ["qaPlan", "tests"],
    },
    prompt: (ctx, prev) => `You are the QA Agent. Create EXACTLY 12 discrete test items covering testing steps, a launch checklist, edge cases, and regression checks for the app. For EACH test item, also write an "auditPrompt": a complete, copy-paste-ready Base44 prompt the user can paste to audit/verify that specific task. Keep each auditPrompt focused and concise (a few short paragraphs).\n\nWorkflows:\n${prev.workflowPlan}\nPages:\n${prev.pagePlan}\n\n${ctx}`,
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
    prompt: (ctx, prev) => `You are an EXPERT PROMPT ENGINEER Agent. Turn the full architecture into an ORDERED sequence of EXACTLY 8 Base44-ready build prompts the user can paste one-by-one. Also produce a short MVP roadmap. Each prompt must be detailed and immediately usable — specify exact entity names, key field names/types, page routes, and acceptance criteria drawn from the plans below. Be concrete but CONCISE; do NOT pad.

ORDERING RULES:
- The FIRST prompt must be a "Foundation" prompt (design system, layout, routing, auth scaffolding).
- Then proceed in dependency order using these category names: Foundation, Entities, Authentication, Roles and Permissions, Public Pages, User Dashboard, Admin Dashboard, Workflows, Backend Functions, Integrations, Security, QA, Polish.
- The "category" field of each prompt MUST be exactly one of those category names.
- The FINAL prompt must be a UI Polish prompt.

EVERY "promptText" MUST follow this markdown structure, kept concise (a few sentences per section, not essays):
## Context
What was built in prior prompts (reference real entities/pages/functions) and where this step fits.
## Objective
The single outcome of this prompt in 1-2 sentences.
## Task
Exactly what to build, step by step.
## Requirements
Concrete details: entity names + key fields/types, page routes + main components, backend function names + auth checks, key UI/UX.
## Safety Rules
Preserve existing work; no duplicates; reuse the design system; add loading/error/empty states; keep ownership/role checks strict.
## Completion Check
A short checklist of what to verify before finishing.

Set "title" to a short build step name, "purpose" to a one-line goal, and "dependencies" to which earlier prompt numbers must be done first.

Architecture:\n${prev.appArchitecture}\nEntities:\n${prev.entityPlan}\nPermissions:\n${prev.rolePermissionPlan}\nPages:\n${prev.pagePlan}\nWorkflows:\n${prev.workflowPlan}\nBackend:\n${prev.backendFunctionPlan}\n\n${ctx}`,
  },
  {
    name: "Optimization Agent",
    key: "optimization",
    schema: {
      type: "object",
      properties: {
        optimizationPrompts: {
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
      required: ["optimizationPrompts"],
    },
    prompt: (ctx, prev) => `You are the Optimization Agent. Produce EXACTLY 6 copy-paste-ready Base44 prompts to IMPROVE this specific app AFTER it has been built. These refine an existing app, not build it. Each "promptText" must be detailed and ready to paste, but CONCISE — no padding.

Cover these categories (weight toward UI Redesign, Sales Copy, and SEO): UI Redesign, Sales Copy, SEO, Conversion, Performance. Every prompt MUST name this app's REAL pages (from the Page Plan below).

For each prompt, the "promptText" must include these concise sections (a few sentences each):
- A one-line bold goal headline naming the target page/area.
- Critical Rule: preserve all existing functionality, logic, links, routes, and (for non-copy categories) text content; only change what the category targets.
- Context: what this page/app does and who it's for.
- Requirements: a specific bulleted list of concrete changes for that category.
- Output: exactly what to deliver, production-ready, with everything else preserved.

For UI Redesign prompts specifically, instruct a full premium responsive redesign of the named page that keeps all content and functionality identical and only transforms the visual design.

Make each prompt self-contained and specific to this app.

Pages:\n${prev.pagePlan}\nArchitecture:\n${prev.appArchitecture}\nExecutive Summary:\n${prev.executiveSummary}\n\n${ctx}`,
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

// As each agent finishes, persist its large array output directly into the right
// entities (keyed by projectId) instead of keeping it in AgentRun.outputData, which
// has a hard size limit. These records are created incrementally across requests.
async function persistAgentArrays(base44, projectId, project, accumulated, result) {
  const ownerId = project.created_by_id;

  if (Array.isArray(result.prompts) && result.prompts.length) {
    const promptPack = await base44.entities.PromptPack.create({
      projectId,
      ownerId,
      title: `${project.projectName} Prompt Pack`,
      description: 'Ordered Base44 build prompts generated from the blueprint.',
      totalPrompts: result.prompts.length,
      status: 'completed',
    });
    await base44.entities.PromptItem.bulkCreate(
      result.prompts.map((p, i) => ({
        promptPackId: promptPack.id,
        projectId,
        ownerId,
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

  if (Array.isArray(result.findings) && result.findings.length) {
    await base44.entities.SecurityFinding.bulkCreate(
      result.findings.map((f) => ({
        projectId,
        ownerId,
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

  if (Array.isArray(result.tests) && result.tests.length) {
    await base44.entities.QAItem.bulkCreate(
      result.tests.map((t) => ({
        projectId,
        ownerId,
        category: t.category || 'general',
        testName: t.testName || '',
        description: t.description || '',
        expectedResult: t.expectedResult || '',
        auditPrompt: t.auditPrompt || '',
        status: 'pending',
      }))
    );
  }

  if (Array.isArray(result.optimizationPrompts) && result.optimizationPrompts.length) {
    await base44.entities.OptimizationPrompt.bulkCreate(
      result.optimizationPrompts.map((p) => ({
        projectId,
        ownerId,
        category: p.category || 'UI Redesign',
        title: p.title || '',
        targetArea: p.targetArea || '',
        purpose: p.purpose || '',
        promptText: p.promptText || '',
        status: 'not_used',
      }))
    );
  }
}

// The full (untruncated) markdown lives ONLY on the Blueprint record, written
// incrementally as each agent finishes. AgentRun.outputData holds only a capped
// copy for the next agent's prompt context (to respect its size limit).
const BLUEPRINT_MD_FIELDS = [
  'executiveSummary', 'appArchitecture', 'entityPlan', 'rolePermissionPlan',
  'pagePlan', 'workflowPlan', 'backendFunctionPlan', 'integrationPlan',
  'securityPlan', 'qaPlan', 'mvpRoadmap',
];

// Entity string fields have a hard size cap. Keep each markdown field comfortably
// under it so the Blueprint record always saves.
const MAX_BLUEPRINT_FIELD_CHARS = 9000;

async function persistBlueprintFields(base44, projectId, project, result) {
  const update = {};
  for (const f of BLUEPRINT_MD_FIELDS) {
    if (typeof result[f] === 'string' && result[f].length) {
      update[f] = result[f].length > MAX_BLUEPRINT_FIELD_CHARS
        ? result[f].slice(0, MAX_BLUEPRINT_FIELD_CHARS)
        : result[f];
    }
  }
  if (Object.keys(update).length === 0) return;

  const existing = (await base44.entities.Blueprint.filter({ projectId }, '-created_date', 1))[0];
  if (existing) {
    await base44.entities.Blueprint.update(existing.id, update);
  } else {
    await base44.entities.Blueprint.create({
      projectId,
      ownerId: project.created_by_id,
      title: `${project.projectName} Blueprint`,
      status: 'generating',
      ...update,
    });
  }
}

// Finalize: the Blueprint record already holds all markdown fields (written
// incrementally). Just mark it complete and link the array records.
async function finalize(base44, projectId, project, accumulated, ownerProfile, user) {
  let blueprint = (await base44.entities.Blueprint.filter({ projectId }, '-created_date', 1))[0];
  if (!blueprint) {
    blueprint = await base44.entities.Blueprint.create({
      projectId,
      ownerId: project.created_by_id,
      title: `${project.projectName} Blueprint`,
      status: 'completed',
    });
  } else {
    await base44.entities.Blueprint.update(blueprint.id, { status: 'completed' });
  }

  // Link the already-created array records to this blueprint.
  const [packs, findingRecords, testRecords, optRecords] = await Promise.all([
    base44.entities.PromptPack.filter({ projectId }),
    base44.entities.SecurityFinding.filter({ projectId }),
    base44.entities.QAItem.filter({ projectId }),
    base44.entities.OptimizationPrompt.filter({ projectId }),
  ]);
  const promptPack = packs[0] || null;
  await Promise.all([
    ...(promptPack ? [base44.entities.PromptPack.update(promptPack.id, { blueprintId: blueprint.id })] : []),
    ...findingRecords.filter((f) => !f.blueprintId).map((f) => base44.entities.SecurityFinding.update(f.id, { blueprintId: blueprint.id })),
    ...testRecords.filter((t) => !t.blueprintId).map((t) => base44.entities.QAItem.update(t.id, { blueprintId: blueprint.id })),
    ...optRecords.filter((o) => !o.blueprintId).map((o) => base44.entities.OptimizationPrompt.update(o.id, { blueprintId: blueprint.id })),
  ]);

  const prompts = await base44.entities.PromptItem.filter({ projectId });
  const findings = findingRecords;
  const tests = testRecords;

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

    const { projectId, intake, profile, restart } = await req.json();
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

    // A "fresh" generation is either: an explicit restart from the UI, OR there are no
    // prior successful runs at all. On a fresh run we wipe ALL prior records (including
    // any existing blueprint) so regenerating cleanly overrides the old one.
    const isFreshStart = restart === true || completedCount === 0;

    // On the very first step, enforce plan limit and flip status to generating.
    let ownerProfile = (await base44.asServiceRole.entities.UserProfile.filter({ userId: project.created_by_id }, '-created_date', 1))[0] || null;
    if (isFreshStart) {
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
      // Clear any stale runs AND partially-persisted records from a previous failed attempt
      // so a fresh generation does not create duplicates.
      const [stalePacks, stalePromptItems, staleFindings, staleTests, staleOpts, staleBlueprints] = await Promise.all([
        base44.entities.PromptPack.filter({ projectId }),
        base44.entities.PromptItem.filter({ projectId }),
        base44.entities.SecurityFinding.filter({ projectId }),
        base44.entities.QAItem.filter({ projectId }),
        base44.entities.OptimizationPrompt.filter({ projectId }),
        base44.entities.Blueprint.filter({ projectId }),
      ]);
      await Promise.all([
        ...existingRuns.map((r) => base44.entities.AgentRun.delete(r.id)),
        ...stalePacks.map((r) => base44.entities.PromptPack.delete(r.id)),
        ...stalePromptItems.map((r) => base44.entities.PromptItem.delete(r.id)),
        ...staleFindings.map((r) => base44.entities.SecurityFinding.delete(r.id)),
        ...staleTests.map((r) => base44.entities.QAItem.delete(r.id)),
        ...staleOpts.map((r) => base44.entities.OptimizationPrompt.delete(r.id)),
        ...staleBlueprints.map((r) => base44.entities.Blueprint.delete(r.id)),
      ]);
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

    // The accumulated markdown grows large across agents. Passing all of it into each
    // prompt makes the LLM call progressively slower and can push the heavy later agents
    // (Prompt Engineer, Optimization) past the function timeout — so they never persist.
    // Cap each context field fed into the prompt to keep every call fast and reliable.
    const MAX_CONTEXT_FIELD_CHARS = 6000;
    const promptContext = {};
    for (const k of Object.keys(accumulated)) {
      promptContext[k] = typeof accumulated[k] === 'string' && accumulated[k].length > MAX_CONTEXT_FIELD_CHARS
        ? accumulated[k].slice(0, MAX_CONTEXT_FIELD_CHARS)
        : accumulated[k];
    }

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
          prompt: nextAgent.prompt(context, promptContext),
          response_json_schema: nextAgent.schema,
          model: 'gemini_3_flash',
        });
        Object.assign(accumulated, result);

        // Large array outputs (prompt pack, security findings, QA tests, optimization
        // prompts) can exceed the AgentRun.outputData size limit. Persist them straight
        // into their own entities now, and keep only the lightweight markdown/summary
        // context fields in outputData for the next agent in the chain.
        await persistAgentArrays(base44, projectId, project, accumulated, result);
        // Write this agent's full markdown straight onto the Blueprint record so nothing
        // is lost to the outputData size cap below.
        await persistBlueprintFields(base44, projectId, project, result);
        const STRIPPED_KEYS = ['prompts', 'findings', 'tests', 'optimizationPrompts'];
        const slimResult = { ...result };
        for (const k of STRIPPED_KEYS) delete slimResult[k];

        // outputData has a hard size limit and only needs to carry THIS agent's output
        // forward as context for later agents (full markdown lives on the Blueprint
        // record). slimResult only holds the current agent's fields, but several agents
        // emit multiple long markdown fields, so cap each one tightly to guarantee the
        // combined JSON always saves.
        const MAX_FIELD_CHARS = 5000;
        for (const k of Object.keys(slimResult)) {
          if (typeof slimResult[k] === 'string' && slimResult[k].length > MAX_FIELD_CHARS) {
            slimResult[k] = slimResult[k].slice(0, MAX_FIELD_CHARS);
          }
        }

        await base44.entities.AgentRun.update(run.id, {
          status: 'success',
          outputSummary: `${nextAgent.name} completed`,
          outputData: JSON.stringify(slimResult),
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