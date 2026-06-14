# Build Runbook (use WHILE implementing)

## Files / areas to change
- ...

## Existing components to reuse
- Shared: PageHeader, AdminTable, LoadingState, EmptyState, ErrorState, StatCard, Seo
- shadcn/ui in `components/ui`
- Existing backend functions (avoid duplicates)

## New components required
- Keep components small and focused (own file each). List them here.

## Entity / data changes
- Additive only (new fields with defaults). No renames/removals. Note RLS impact.

## Permission checks
- UI gating (AdminRoute / ProtectedRoute). Backend `user.role === 'admin'` for admin-only.
- RLS preserved; no private/admin data exposed.

## UI states
- Loading, empty, error, success — all handled for the asked flow.

## Mobile checks
- Layout works at small widths (the app also publishes to iOS/Android).

## Desktop checks
- Layout works at standard desktop widths.

## Validation checks
- Required fields block submit with clear messages; saves persist; lists refresh after changes.

## Final QA checklist
- Run `05_REGRESSION_CHECKLIST.md`.
- For new public pages: GA4 tracking added + SEO pass done (title/description/og image/canonical).