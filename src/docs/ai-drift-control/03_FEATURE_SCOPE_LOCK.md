# Feature Scope Lock (fill in BEFORE any major change)

Copy this template and complete it before implementing. If a section is unknown, scan the app first.

## Requested change
> One-sentence description of exactly what the user asked for.

## In scope
- ...

## Out of scope (will NOT be touched)
- Existing routes, roles, entity/field names (unless explicitly requested)
- Existing user-facing copy
- Existing working logic / unrelated pages
- ...

## Affected pages / components / entities / functions
- Pages: ...
- Components: ...
- Entities: ...
- Backend functions: ...

## Risk areas
- ...

## Permission concerns
- Does this touch admin-only or private data? How is access enforced (AdminRoute / ProtectedRoute /
  RLS / `user.role === 'admin'` in backend)?

## Validation requirements
- Required fields, form validation, payment/permission gating, etc.

## Rollback notes
- How to revert (files/edits to undo) if this change causes regressions.