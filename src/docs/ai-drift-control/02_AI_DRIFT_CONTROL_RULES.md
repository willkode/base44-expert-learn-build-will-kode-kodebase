# AI Drift Control Rules

These rules are **non-negotiable** for every future task on this project.

## 1. Scan before changing
- Read `01_APP_CONTEXT_MAP.md` and the actual files involved before editing.
- Never claim or assume behavior of code you have not read.

## 2. Reuse before creating
- Check for an existing page, component, function, entity, or util that already does the job.
- Reuse shared components (`PageHeader`, `AdminTable`, `LoadingState`, `EmptyState`, `ErrorState`,
  `StatCard`, shadcn/ui) and existing backend functions (see `<existing_backend_functions>`).
- Do not create a second system that overlaps an existing one.

## 3. Preserve user-facing copy
- Do not rewrite headings, button labels, marketing text, legal, pricing, or testimonials unless
  the task explicitly asks for that copy change.

## 4. Preserve routes
- App.jsx is the route source of truth. Do not rename, remove, or re-point existing routes.
- When adding a page, add its import + Route in the same change and follow existing nesting/layout.

## 5. Preserve roles & permissions
- Keep `user` / `admin` semantics. Admin UI stays behind `AdminRoute`; admin backend functions
  verify `user.role === 'admin'`. Never loosen RLS or expose admin/private data.

## 6. Preserve entity & field names
- Do not rename entities or fields. Add fields additively (with defaults) when needed.
- Never store large blobs in entity fields (upload files, store URLs).

## 7. Avoid duplicates
- No duplicate components/pages/entities/functions. If a duplicate or broken implementation
  already exists, prefer consolidating onto the canonical one (and report it).

## 8. Make the smallest safe change
- Minimal, focused edits. Prefer `find_replace` over rewriting files. No speculative refactors,
  no extra features, no "while I'm here" cleanup of untouched code.

## 9. Respect the design system
- Use design tokens and `font-sora`/`font-inter`; no hardcoded hex/inline colors.
- All AI-generated images follow the dark tech aesthetic spec in the App Context Map.

## 10. New pages: tracking + SEO
- Add GA4 event tracking (`lib/analytics.js`) for new pages/key actions.
- Run an SEO pass with `components/seo/Seo` (title, description, og image, canonical) on new public
  pages; add a `SeoSetting`-compatible path where relevant.

## 11. Report what changed
- Finish every task with the `06_CHANGE_REPORT.md` format.