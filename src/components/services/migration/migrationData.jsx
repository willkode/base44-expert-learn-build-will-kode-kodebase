export const replacedItems = [
  "Base44 authentication",
  "Base44 entities and database storage",
  "Backend functions",
  "File uploads and private storage",
  "Email and SMS integrations",
  "AI and LLM integrations",
  "Realtime subscriptions",
  "Scheduled automations",
  "Webhooks",
  "Payment processing",
  "User roles and permissions",
  "Analytics and application logs",
];

export const compatFocus = [
  "Database access",
  "User authentication",
  "Business logic",
  "Backend functions",
  "Third-party integrations",
  "Storage",
  "Realtime updates",
  "Automations",
  "Deployment infrastructure",
];

export const includedSections = [
  {
    title: "Complete Application Discovery",
    intro: "Before changing the application, we map its existing architecture. This discovery phase produces a clear migration plan before major development begins.",
    items: ["All Base44 entities and data fields", "Entity relationships", "Backend functions", "Authentication flows", "User roles and permissions", "External integrations", "Webhooks", "Scheduled functions", "Entity-triggered automations", "File storage", "Realtime subscriptions", "AI agents and LLM features", "Payment workflows", "Frontend dependencies", "Environment variables and secrets"],
  },
  {
    title: "Standalone Database",
    intro: "Your Base44 entities are migrated to a database you control — PostgreSQL, Supabase, Neon, Firebase, or another database selected for your application's requirements. Where Base44 uses loosely connected string identifiers, we can convert appropriate relationships into indexed database references.",
    items: ["Entity schema conversion", "Relationship mapping", "Database indexes", "Audit fields", "Data validation", "Existing record migration", "User data migration", "Development and production environments", "Backup planning"],
  },
  {
    title: "Independent Authentication",
    intro: "We replace Base44 authentication with an authentication system that your application controls — rebuilt to match the requirements of the existing application rather than forcing users into an entirely new experience.",
    items: ["Email and password registration", "Email verification", "One-time passcodes", "Login and logout", "Password recovery and reset", "Refresh tokens and secure sessions", "Role-based access", "Administrative permissions", "Google or Microsoft OAuth", "Additional social login providers", "User invitation workflows"],
  },
  {
    title: "Backend Function Migration",
    intro: "Base44 backend functions are reviewed and migrated individually. Duplicate or inconsistent business logic may be consolidated into shared backend services — preserving intended behavior while improving maintainability.",
    items: ["Payment processing", "Stripe webhooks", "Transaction calculations", "Notifications", "Email and SMS delivery", "User verification", "Reporting", "Administrative actions", "Data processing", "AI requests", "Scheduled jobs", "External API integrations", "Entity-triggered workflows"],
  },
  {
    title: "File Storage",
    intro: "Base44 file storage can be replaced with independent storage such as Amazon S3, Cloudflare R2, Supabase Storage, private server storage, or another compatible object-storage provider.",
    items: ["Public file uploads", "Private file uploads", "Signed download links", "Access-controlled files", "Image storage", "Document storage", "Existing file migration", "Storage permission rules"],
  },
  {
    title: "Integrations",
    intro: "Existing Base44 integrations can be replaced with direct provider integrations. Each integration is reviewed to determine whether it should be migrated, replaced, improved, or removed.",
    items: ["Resend, SendGrid, Postmark, Amazon SES", "Twilio", "OpenAI and Anthropic", "Google APIs", "Stripe and Square", "Cloudflare", "Slack", "GitHub", "CRM platforms", "Accounting platforms", "Custom REST APIs"],
  },
  {
    title: "Realtime Features",
    intro: "Applications using Base44 subscriptions or realtime messaging can be migrated to an independent realtime system — Socket.IO, Supabase Realtime, native WebSockets, or managed pub/sub services.",
    items: ["Chat messages", "Notifications", "Status changes", "Live dashboards", "Entity updates", "Support conversations", "User activity", "Collaborative features"],
  },
  {
    title: "Automations and Scheduled Jobs",
    intro: "Base44 automations can be rebuilt using cron jobs, background workers, queue systems, database-backed workflow runners, external automation services, or durable workflow platforms.",
    items: ["Scheduled emails", "Payment reminders", "Follow-up sequences", "Expiration checks", "Data synchronization", "Reporting jobs", "Entity-change triggers", "Webhook-triggered workflows", "Delayed actions"],
  },
];

export const stacks = [
  {
    title: "Supabase Migration",
    subtitle: "Often the fastest option",
    desc: "Reduces the amount of custom backend infrastructure required while moving the application to a more portable and widely supported ecosystem.",
    items: ["PostgreSQL", "Authentication", "File storage", "Realtime functionality", "Row-level security", "Serverless functions"],
  },
  {
    title: "Custom Node + PostgreSQL",
    subtitle: "Maximum control",
    desc: "The better option for complex business logic, custom authentication, advanced integrations, high transaction volume, and specialized security requirements.",
    items: ["React + Vite + TypeScript", "Node.js + Express", "PostgreSQL + Prisma", "Socket.IO", "Cloudflare R2 or Amazon S3", "Reduced BaaS dependency"],
  },
  {
    title: "Alternative Architecture",
    subtitle: "Purpose-built stacks",
    desc: "We can also migrate to another stack when the application has specific technical, compliance, hosting, or organizational requirements.",
    items: ["Compliance-driven hosting", "Specific cloud providers", "Organizational standards", "Specialized databases", "Existing team stacks", "Custom deployment targets"],
  },
];

export const processSteps = [
  { num: "01", title: "Repository & architecture review", desc: "We review the exported GitHub repository, application structure, entity schemas, backend functions, dependencies, and integrations." },
  { num: "02", title: "Migration scope", desc: "We document what must be migrated, what can remain unchanged, and what should be replaced." },
  { num: "03", title: "Infrastructure setup", desc: "We configure the new database, backend, authentication system, storage, secrets, and deployment environments." },
  { num: "04", title: "Compatibility layer", desc: "Where practical, we replace the Base44 client with a compatible client that communicates with the new backend." },
  { num: "05", title: "Backend migration", desc: "Entities, functions, integrations, automations, storage, permissions, and realtime features are migrated." },
  { num: "06", title: "Data migration", desc: "Existing application data is exported, transformed, validated, and imported into the new database." },
  { num: "07", title: "Testing & QA", desc: "We test major workflows, permissions, integrations, user roles, authentication, forms, payments, and application functionality." },
  { num: "08", title: "Deployment & handoff", desc: "The standalone application is deployed to infrastructure owned or controlled by the client." },
];

export const deliverables = [
  "Migration architecture report",
  "Complete dependency inventory",
  "Standalone frontend repository",
  "Standalone backend repository",
  "Independent database",
  "Authentication system",
  "Migrated backend functions",
  "Rebuilt integrations",
  "File storage configuration",
  "Realtime infrastructure",
  "Scheduled jobs and automations",
  "Environment configuration",
  "Deployment configuration",
  "Data migration",
  "Security review",
  "Functional testing",
  "Production deployment",
  "Technical documentation",
  "Final handoff",
];

export const pricingFactors = [
  "Number of entities",
  "Number of backend functions",
  "Authentication complexity",
  "Number of user roles",
  "Existing data volume",
  "Payment integrations",
  "External APIs",
  "Realtime functionality",
  "File storage",
  "Scheduled automations",
  "AI features",
  "Mobile application requirements",
  "Security and compliance requirements",
  "Deployment architecture",
];

export const reviewNeeds = [
  "Access to the exported GitHub repository",
  "A list of important application workflows",
  "Details about current users and data",
  "A list of external integrations",
  "Payment provider information",
  "Preferred hosting provider",
  "Preferred backend technology, if already selected",
  "Access to a test account",
  "Any known security or production issues",
];

export const readinessItems = [
  "Base44 runtime dependencies",
  "Missing exported functionality",
  "Backend migration requirements",
  "Data migration complexity",
  "Authentication requirements",
  "Integration dependencies",
  "Security concerns",
  "Hardcoded secrets",
  "Undocumented fields",
  "Broken or unused functions",
  "Estimated migration effort",
  "Recommended technology stack",
];

export const faqs = [
  { q: "Will my application look different after migration?", a: "Not necessarily. In many cases, the existing React frontend can be preserved while the backend is replaced. Changes may be required when the application relies on Base44-hosted authentication screens, platform-specific UI, or functionality that was never included in the exported repository." },
  { q: "Will my existing users and data be migrated?", a: "Existing users and application data can usually be migrated, provided the necessary data can be exported and the target authentication system supports the required transition. User passwords may require special handling because password hashes are not always exportable between authentication systems." },
  { q: "Can you migrate payments and subscriptions?", a: "Yes. Stripe, Square, and other payment integrations can be migrated, including checkout, subscriptions, webhooks, transaction records, and payment status synchronization. Payment migration complexity depends on how the current application was implemented." },
  { q: "Can you migrate Base44 AI features?", a: "Yes. Base44 LLM and AI integrations can be replaced with direct provider integrations such as OpenAI, Anthropic, or another compatible provider." },
  { q: "Can you migrate Base44 agents?", a: "Agent functionality can be rebuilt using independent LLM APIs, tool calling, conversation storage, application permissions, and realtime messaging. Agent migrations are typically more complex than standard LLM request migrations." },
  { q: "Can the migrated app still be developed with AI coding tools?", a: "Yes. The standalone application can continue to be developed using tools such as Cursor, Claude Code, GitHub Copilot, or other AI-assisted development environments." },
  { q: "Will the application still depend on Base44?", a: "The objective of a full migration is to eliminate Base44 runtime dependencies. The finished application should use its own backend, database, authentication, storage, integrations, and hosting." },
  { q: "Can you migrate only part of the application?", a: "Yes. A phased migration may begin with the database, authentication, backend functions, or another isolated system. The feasibility of a partial migration depends on how tightly the application's systems are connected." },
  { q: "Can you build a reusable Base44-compatible backend platform?", a: "Yes, but this is substantially larger than migrating one application. A reusable platform must support dynamic entities, multiple applications, authentication, function execution, workflows, connectors, agents, integrations, realtime systems, payments, environments, and data import for applications that have not yet been created. This requires a separate architecture, scope, and budget." },
  { q: "How is migration pricing determined?", a: "Migrations start at $2,000. Pricing depends on entities, backend functions, authentication complexity, user roles, data volume, payments, external APIs, realtime functionality, storage, automations, AI features, and deployment architecture. A smaller application may remain close to the starting price; complex applications receive a custom estimate." },
];