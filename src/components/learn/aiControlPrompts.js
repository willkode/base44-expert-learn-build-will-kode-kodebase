// Free AI control prompts — copy-paste guardrails for keeping AI builders on track.
export const AI_CONTROL_PROMPTS = [
  {
    id: "scan-first",
    title: "Scan Before You Change",
    category: "Drift Control",
    description: "Forces the AI to map the existing app before touching anything, so it builds on what exists instead of duplicating it.",
    prompt: `Before making any changes, scan the app and report back:
1. The pages, components, entities, and backend functions related to this request.
2. Any existing feature that already does part of what I'm asking for.
3. The design patterns and reusable components you plan to reuse.

Do NOT write any code yet. Wait for my confirmation after the scan report.`,
  },
  {
    id: "scope-lock",
    title: "Feature Scope Lock",
    category: "Drift Control",
    description: "Locks exactly what is in and out of scope before a build starts, preventing scope creep and unrelated edits.",
    prompt: `Before building, produce a Scope Lock and wait for my approval:
- Requested change (one sentence)
- In scope (exact list)
- Out of scope (everything you will NOT touch)
- Affected pages / components / entities / functions
- Risk areas
- Permission concerns
- Rollback notes

Only after I reply "approved" may you start building. Anything not listed as in-scope must not be modified.`,
  },
  {
    id: "smallest-change",
    title: "Smallest Safe Change",
    category: "Drift Control",
    description: "Stops the AI from refactoring, redesigning, or rewriting working code while making a fix.",
    prompt: `Make ONLY the smallest change needed to complete this request.
Rules:
- Do not refactor, redesign, or "improve" anything I didn't ask for.
- Do not rename routes, entities, fields, roles, or components.
- Do not rewrite any user-facing copy.
- Do not delete or replace working logic.
- If a bigger change seems necessary, stop and explain why before doing it.`,
  },
  {
    id: "copy-preservation",
    title: "Copy Preservation Guard",
    category: "Content Safety",
    description: "Protects your existing headlines, marketing copy, and legal text during design or layout changes.",
    prompt: `While making this change, preserve ALL existing user-facing text exactly as written — headlines, body copy, button labels, pricing text, legal text, and empty-state messages.
You may restyle, move, or resize text, but you may not reword, shorten, or "improve" it. If any copy must change for the feature to work, list the exact before/after and ask me first.`,
  },
  {
    id: "route-guard",
    title: "Route & Navigation Safety",
    category: "Structure Safety",
    description: "Prevents broken links, changed URLs, and orphaned pages when the AI edits navigation or adds pages.",
    prompt: `When changing navigation or adding pages:
1. Do not change or remove any existing route URLs — other pages, emails, and ads may link to them.
2. Every new page must be added to the router AND reachable from navigation.
3. After changes, list every route you touched and confirm no existing link now 404s.
4. Protected pages must stay behind authentication; admin pages must stay behind admin checks.`,
  },
  {
    id: "permission-guard",
    title: "Permissions & Data Privacy Guard",
    category: "Security",
    description: "Makes the AI verify roles, ownership, and data access rules any time it touches data or adds features.",
    prompt: `Before finishing this task, verify and report:
1. Regular users cannot see, edit, or delete other users' data.
2. Admin-only pages, buttons, and data remain admin-only.
3. Any new entity or field has correct access rules (who can read, who can write).
4. No backend function exposes data without checking the caller's identity and role.
List each check and its result. If any check fails, fix it before reporting done.`,
  },
  {
    id: "no-duplicates",
    title: "Duplicate Prevention",
    category: "Structure Safety",
    description: "Stops the AI from creating a second version of a feature, component, or entity that already exists.",
    prompt: `Before creating anything new, check whether an existing page, component, entity, or function already does this.
- If yes: extend or reuse the existing one. Tell me what you reused.
- If it exists but is broken: fix the existing one instead of building a parallel version.
- Only create something new if nothing similar exists — and say so explicitly.
Never leave two components, pages, or entities doing the same job.`,
  },
  {
    id: "design-system-lock",
    title: "Design System Lock",
    category: "Design Safety",
    description: "Keeps new UI consistent with your existing colors, fonts, spacing, and component styles.",
    prompt: `All new UI must match the app's existing design system:
- Reuse the existing color tokens, fonts, button styles, card styles, and spacing patterns.
- Do not introduce new colors, fonts, or one-off styles.
- Match the visual weight and tone of neighboring sections.
- Ensure it looks correct on both mobile and desktop.
If you believe the design system needs a new token or pattern, propose it first instead of hardcoding values.`,
  },
  {
    id: "regression-check",
    title: "Regression Checklist",
    category: "Quality",
    description: "A post-change checklist that catches things the AI accidentally broke while building something else.",
    prompt: `After completing the change, run this regression checklist and report each item as PASS or FAIL:
- All existing routes still load
- Forms still validate and required fields still block submit
- Buttons and links still work
- Permissions still hold (users can't see admin or other users' data)
- Existing records still load and display
- Existing copy is unchanged
- Mobile layout works
- Desktop layout works
- No duplicate feature or component was created
Fix any FAIL before declaring the task done.`,
  },
  {
    id: "change-report",
    title: "Change Report",
    category: "Quality",
    description: "Requires a structured report after every task so you always know exactly what the AI touched.",
    prompt: `When you finish, give me a Change Report in this exact format:
- What changed (bullet list)
- What was preserved (routes, copy, permissions, entities)
- Files / pages / components affected
- Entities or data affected
- Roles and permissions checked
- Testing completed
- Risks or follow-up items
Do not skip any section. If a section is empty, write "none".`,
  },
  {
    id: "entity-safety",
    title: "Entity & Data Safety Guard",
    category: "Security",
    description: "Protects your database structure and existing records when the AI modifies entities or fields.",
    prompt: `When touching entities or data:
1. Never rename or delete existing entities or fields — existing records depend on them.
2. New fields must be optional or have safe defaults so old records still load.
3. Never run bulk deletes or bulk updates unless I explicitly ask for them.
4. Keep legacy fields intact for backwards compatibility and note them.
Report every schema change you made and confirm old records still work.`,
  },
  {
    id: "still-broken",
    title: "Root Cause, Not Symptom",
    category: "Debugging",
    description: "Use when a fix didn't work — forces the AI to widen its investigation instead of re-applying the same failed fix.",
    prompt: `The previous fix did not solve the problem. Do NOT re-apply the same fix.
Instead:
1. Re-read all code that governs this behavior — including files you haven't looked at yet.
2. Trace my exact action step-by-step through the code to find where it actually fails.
3. Explain the root cause in plain language before changing anything.
4. Then fix the root cause, not the symptom.`,
  },
];