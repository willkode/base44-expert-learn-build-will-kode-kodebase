# App Context Map — KodeBase

> Keep this updated when structure genuinely changes. Do not let it drift from reality.

## App purpose
KodeBase is a SaaS / developer tool that helps builders plan and ship Base44 apps. Users create
projects, generate AI **blueprints**, get **prompt packs**, run **security reviews** and **QA
checklists**, and export client-ready reports. It also includes a public marketing site, a
learning hub, one-time PDF products, subscription plans (Square), an AI email marketing suite
(Resend), and an admin back office.

## User roles
- **user** (default) — standard authenticated customer. Owns their own projects/blueprints.
- **admin** — full back-office access (users, projects, blueprints, logs, templates, videos,
  marketing, email, settings, analytics).
- Anonymous/public visitor — marketing + learn pages, products, contact, auth pages.

Role source of truth: built-in `User.role`. Admin gating in UI via `components/layout/AdminRoute.jsx`
(`user.role !== "admin"` blocks). Backend admin-only functions verify `user.role === 'admin'`.

## Plans (lib/plans.js)
- `free` ("Solo"), `pro` ("Pro"), `agency` ("Agency"). Limits: projectLimit, blueprintLimit
  (-1 = unlimited). Monthly blueprint usage reset logic lives in `lib/plans.js`. **Do not** change
  prices, limits, or plan ids without explicit request.

## Major pages / routes (App.jsx is the source of truth)
Public (PublicLayout): `/features`, `/pricing`, `/products`, `/products/:slug`, `/contact`,
`/learn/blog`, `/learn/blog/:slug`, `/learn/prompt-library`, `/learn/prompt-library/:slug`,
`/learn/agent-skills`, `/learn/superagent`, `/learn/videos`, `/learn/llm-guide`.
Home: `/`.
Auth: `/login`, `/register`, `/forgot-password`, `/reset-password`.
Authenticated (ProtectedRoute): `/checkout`, `/download/:productId`, and AppLayout pages
`/dashboard`, `/projects`, `/projects/new`, `/projects/:id` (overview, blueprint, prompts,
optimize, security, qa, launch-audit), `/settings`, `/help`.
Admin (AdminRoute, inside AppLayout): `/admin`, `/admin/users`, `/admin/projects`,
`/admin/blueprints`, `/admin/logs`, `/admin/templates`, `/admin/videos`, `/admin/marketing`,
`/admin/marketing/prompt-library`, `/admin/marketing/email/*` (dashboard, contacts, lists,
segments, campaigns, studio, calendar, automations, analytics, suppression, logs, settings),
`/admin/settings`, `/admin/analytics`.

## Major workflows
- **Blueprint generation** — async background-worker architecture using gpt_5_5, watchdog
  scheduled function auto-resumes stalled runs. Functions: `generateBlueprint`,
  `cleanupOldBlueprints`. Entity: `Blueprint`, `AgentRun`.
- **Prompt packs / optimization / security review / QA checklist** — per-project tooling.
- **Payments** — Square hosted checkout links (`createSquareCheckoutLink`), webhook reconcile
  (`squarePaymentWebhook`), plan/product sync (`syncSquarePlans`, `syncSquareProducts`).
- **PDF product delivery** — private storage + signed URL (`getProductDownload`), gated by paid
  `Payment` record, 1-hour signed URL.
- **Email marketing** — Resend Contacts/Segments model; campaigns, sequences, suppression,
  webhook tracking (`resendWebhook`).
- **Newsletter** — `subscribeNewsletter` syncs to Resend global Contacts + segment.
- **Prompt Library content** — `generatePromptPost` (AI SEO + image), admin manage page, public
  `/learn/prompt-library/:slug`.
- **Contact** — `submitContactForm` (honeypot), `ContactMessage` entity.

## Major entities
Project, Blueprint, AgentRun, PromptPack, Template, Video, UserProfile, Product, Payment,
SquarePlan, ContactMessage, LibraryPrompt, BlogPost, NewsletterSubscriber, SeoSetting, AppSetting,
OptimizationPrompt, QAItem, SecurityFinding, PromptItem, ProjectIntake, and the Email* suite
(EmailSettings, EmailContact, EmailList, EmailListMembership, EmailSegment, EmailCampaign,
EmailTemplate, EmailSequence, EmailSequenceStep, EmailSequenceEnrollment, EmailSend, EmailEvent,
EmailSuppression, EmailAutomationLog). Built-in: User.

## Admin-only areas
All `/admin/**` routes (gated by AdminRoute). Most marketing/email entities are admin-write-only
or admin-read+write via RLS. Backend admin functions must verify `user.role === 'admin'`.

## Protected / private areas
Everything under ProtectedRoute (dashboard, projects, settings, help, checkout, download).
Private file storage for paid PDFs; downloads require a verified `Payment` and a time-limited
signed URL.

## Integrations
- **Square** — payments (secrets: SQUARE_*). Hosted checkout + webhooks.
- **Resend** — email + newsletter (secrets: RESEND_API_KEY, RESEND_WEBHOOK_SECRET).
- **Google Analytics 4** — gtag.js global, helpers in `lib/analytics.js`.
- **InvokeLLM / GenerateImage** — Base44 Core integrations (blueprints, prompt posts, images).
- Workspace OAuth connectors registered: gmail (KodeLead), googledrive (x3), google_search_console,
  tiktok — used by marketing/content workflows.

## Known design patterns / design system
- Dark tech aesthetic. Tokens in `index.css` (HSL vars) + `tailwind.config.js`. Fonts: Sora
  (headings, `font-sora`) + Inter (body, `font-inter`). Primary = red; gradient accent
  `#f87171 → #fb923c → #facc15` (`.text-gradient-orange`, `.glow-orange`, `.blueprint-grid`).
- Shared UI: `PageHeader`, `AdminTable`, `LoadingState`, `EmptyState`, `ErrorState`, `StatCard`,
  shadcn/ui in `components/ui`, rounded-2xl cards.
- SEO: `components/seo/Seo` + `lib/seo.js` + `SeoSetting` overrides.
- AI images: dark navy (#0d1326/#0a0f1e), orange→amber glow, flat vector, blueprint grid, no text.