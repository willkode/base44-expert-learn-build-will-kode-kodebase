# AI Drift Control System — KodeBase

This folder is **internal developer/AI guidance only**. It is not a product feature, is not
routed, and must never be surfaced to end users.

Its purpose is to prevent future AI changes from drifting away from the existing app structure,
logic, design system, routes, roles, entities, permissions, and business workflows.

## How to use this
Before starting ANY task on this project, the AI (or developer) must:
1. Read `01_APP_CONTEXT_MAP.md` to understand the app.
2. Follow `02_AI_DRIFT_CONTROL_RULES.md` for every change.
3. Fill out `03_FEATURE_SCOPE_LOCK.md` before any major change.
4. Follow `04_BUILD_RUNBOOK.md` while implementing.
5. Run `05_REGRESSION_CHECKLIST.md` before finishing.
6. Deliver `06_CHANGE_REPORT.md` as the final report.

## Golden rule
> Make the **smallest safe change** that fulfills the request. Scan before changing.
> Reuse before creating. Preserve copy, routes, roles, entities, and working logic.

## Files
- `00_README.md` — this file
- `01_APP_CONTEXT_MAP.md` — what the app is, its routes/roles/entities/workflows
- `02_AI_DRIFT_CONTROL_RULES.md` — non-negotiable operating rules
- `03_FEATURE_SCOPE_LOCK.md` — pre-change scope template
- `04_BUILD_RUNBOOK.md` — implementation template
- `05_REGRESSION_CHECKLIST.md` — pre-completion checklist
- `06_CHANGE_REPORT.md` — required final report format