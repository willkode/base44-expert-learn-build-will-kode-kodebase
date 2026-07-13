# Feature Scope Lock — Base44 Migration Planner

## User Problem
Authorized Base44 app owners need a secure repository assessment, paid migration plan, explainable quote, and migration-service conversion flow.

## Roles
- Authenticated customer: own assessments, previews, entitled reports, quotes, payments, consultations.
- Administrator: all projects, reports, quotes, pricing, payments, settings, access controls, and audit history.

## In Scope
Authenticated planner landing, assessment wizard, per-user GitHub OAuth, ZIP fallback, deterministic repository inspection, persistent scan state, free preview, Square $25 checkout and verified entitlement, full report, quote engine with $2,000 floor, deposit/full checkout, consultation recording, PDF export, customer dashboard, admin management, notifications, GA4, responsive states, and server-side ownership/admin validation.

## Routes
- /migration-planner
- /migration-planner/new
- /migration-planner/projects/:id
- /migration-planner/projects/:id/report
- /migration-planner/projects/:id/quote
- /admin/migration-planner

## Existing Systems Reused
AppLayout, AdminRoute, Square checkout/webhook configuration, Core email integration, Base44 private file storage, app-user OAuth connectors, shared UI components, analytics helpers, SEO component.

## Security Boundary
Repository tokens stay in connector storage. Raw inventory, findings, full reports, entitlements, and payment writes are server-mediated. Every function authenticates and verifies record ownership; admin operations verify role server-side. Payment amounts are recalculated server-side. Webhooks are signature-verified and idempotent. Secrets are redacted.

## Required States
Loading, empty, disconnected, authorization blocked, scanning by stage, scan failed/retry, preview ready, report locked, checkout pending/failed, report ready, quote manual review/expired, unauthorized, and unsupported repository.

## Must Not Change
Existing product checkout behavior, Prompt Engine unlocks, current service pages, authentication templates, unrelated entities, and unrelated admin tools.

## Rollback
Remove planner routes/navigation, planner components/functions/entities, and planner-specific branches in the existing Square webhook.