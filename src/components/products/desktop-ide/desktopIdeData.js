export const HERO_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/880b29606_generated_image.png";
export const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/5579b0a4d_generated_image.png";

// Set this to the .exe download URL when available. While empty, the free
// download button sends visitors to the early-access list instead.
export const DOWNLOAD_URL = "";

export const PRICING = [
  {
    name: "Base44 Desktop",
    price: "Free",
    priceNote: "Free download. Yours forever.",
    tagline: "The full desktop IDE for managing your Base44 projects.",
    cta: "Download Free",
    highlight: false,
    features: [
      "Project Command Center",
      "Base44 Resource Explorer",
      "Files IDE with reviewable AI patches",
      "Connectors, APIs & MCP management",
      "Logs, diagnostics, notes & decisions",
      "Safe deployment previews",
    ],
  },
  {
    name: "Desktop Pro Access",
    badge: "🚀 Launch Special",
    price: "$15",
    compareAt: "$25/mo",
    priceNote: "One-time payment. Lifetime access. Pricing changes to $25/mo on August 1, 2026.",
    tagline: "Unlock the complete prompt, audit, and testing arsenal.",
    cta: "Claim Lifetime Access — $15",
    highlight: true,
    features: [
      "Full Prompt Vault — every proven prompt",
      "Prompt Lab testing & comparisons",
      "Security & production audits",
      "Agent user testing with personas",
      "Complete Agent Skills library",
      "All future Pro content updates",
    ],
  },
];

export const PAIN_POINTS = [
  { title: "Too many disconnected tools", body: "Projects, prompts, logs, APIs, testing, documentation, and deployment commands live in different places." },
  { title: "Limited project visibility", body: "It can be difficult to see the complete state of entities, functions, agents, connectors, authentication, and local files at once." },
  { title: "Repetitive development work", body: "Teams repeatedly write similar prompts, run the same checks, troubleshoot the same issues, and rebuild the same workflows." },
  { title: "Expensive mistakes", body: "Permission problems, exposed data, missing secrets, broken routes, disconnected integrations, and unsafe deployments are often discovered too late." },
];

export const BENEFITS = [
  { title: "See every Base44 project in one place", body: "Connect your Base44 account and instantly organize the applications and backend projects you can access. See project type, connection status, audit score, failed tests, recent activity, integrations, and deployment health without opening every app individually.", benefit: "Spend less time searching and more time building." },
  { title: "Manage the full Base44 backend visually", body: "Inspect and manage entities, functions, agents, connectors, authentication, secrets, automations, and APIs from a structured desktop interface. Review local and remote resources before making changes.", benefit: "Understand your backend without manually digging through folders and configuration files." },
  { title: "Turn better prompts into reusable development systems", body: "Save your strongest Base44 prompts in a searchable Prompt Vault. Organize them by project, purpose, feature, or workflow. Add variables, compare versions, test outputs, and reuse proven instructions across applications.", benefit: "Stop rewriting prompts and repeating avoidable mistakes." },
  { title: "Find security and production issues before users do", body: "Run structured audits across permissions, authentication, entities, functions, connectors, secrets, code quality, mobile behavior, performance, and production readiness. Every finding includes evidence, severity, affected resources, and recommended remediation.", benefit: "Catch expensive issues before launch." },
  { title: "Test your app through the eyes of real users", body: "Create user personas and automated journeys that interact with your application like a customer, administrator, first-time user, mobile visitor, or unauthorized user. Capture failed actions, console errors, broken requests, screenshots, and unexpected behavior.", benefit: "Discover problems that basic code checks cannot find." },
  { title: "Deploy with confidence", body: "Preview which resources will be created, changed, removed, or require authorization before running a deployment. Base44 Desktop highlights destructive changes, missing secrets, disconnected connectors, failed tests, and critical audit findings.", benefit: "Know what a deployment will change before it changes anything." },
];

export const FEATURES = [
  { name: "Project Command Center", tagline: "Every application. One organized view.", body: "Connect your Base44 account and view all accessible applications alongside locally linked projects. Open the Base44 app, local folder, terminal, logs, audits, or tests directly from the project dashboard.", items: ["Project type", "Base44 application ID", "Local connection status", "Git branch", "Audit score", "Failed tests", "Connector status", "Recent deployments", "Open findings", "Recent activity"] },
  { name: "Base44 Resource Explorer", tagline: "Understand the complete structure behind your application.", body: "Compare local resources with their connected Base44 project and identify missing, changed, or conflicting configurations.", items: ["Entities and schemas", "Backend functions", "Agents", "Shared connectors", "App-user connectors", "Authentication methods", "Secrets", "Automations", "External APIs", "MCP connections"] },
  { name: "Files IDE", tagline: "Edit local Base44 projects without leaving the app.", body: "Base44 Desktop shows exactly which files will change before an AI-generated edit is applied.", items: ["File explorer", "Monaco code editor", "TypeScript support", "JSONC validation", "Project-wide search", "Problems panel", "Git changes", "File history", "Base44 resource awareness", "Reviewable AI-generated patches"] },
  { name: "Prompt Vault", tagline: "Build once. Reuse everywhere.", body: "Add reusable variables, project context, instructions, expected output formats, and model recommendations. Track every version and see which prompts consistently produce the best results.", items: ["Application planning", "UI development", "Entity creation", "Permission audits", "Security fixes", "API integrations", "Mobile optimization", "Production readiness", "Migration planning", "Agent creation", "Bug diagnosis"] },
  { name: "Prompt Lab", tagline: "Test prompts before using credits inside your project.", body: "Run prompts against selected files, schemas, functions, notes, and project requirements. Compare results, identify missing instructions, detect contradictions, and evaluate whether the response follows Base44 platform requirements.", items: ["A copied prompt", "A project prompt", "An implementation plan", "A reviewable code patch", "A reusable Prompt Vault template"] },
  { name: "Security & Production Audits", tagline: "Replace vague AI opinions with evidence-backed findings.", body: "Every finding includes severity, evidence, affected resource, business impact, recommended fix, and verification instructions.", items: ["Entity access rules", "User data isolation", "Role-based permissions", "Authentication flows", "Admin route protection", "Secret exposure", "Function authorization", "Connector permissions", "Hardcoded credentials", "Broken routes", "Missing validation", "Performance risks", "Mobile usability", "Accessibility", "Deployment readiness"] },
  { name: "Agent User Testing", tagline: "Let automated users test what real users will experience.", body: "Assign each persona a goal and let the testing agent navigate the application. Convert confirmed failures into reusable regression tests.", items: ["First-time customer", "Returning user", "Administrator", "Unauthorized visitor", "Mobile user", "Low-vision user", "Nontechnical user", "User entering invalid information"] },
  { name: "Connectors and APIs", tagline: "Add external services without losing track of credentials, scopes, and dependencies.", body: "Base44 Desktop identifies overly broad permissions, missing scopes, disconnected accounts, unused connectors, and functions that depend on unavailable services.", items: ["Shared Base44 connectors", "Per-user OAuth connectors", "External REST APIs", "OpenAPI specifications", "Backend API wrappers", "Webhooks", "Secret references", "OAuth scopes", "Function dependencies"] },
  { name: "MCP Management", tagline: "Connect the right tools to the right project.", body: "Control which tools can read information, which can make changes, and which require confirmation.", items: ["Base44 account MCP", "Base44 documentation MCP", "Custom MCP servers", "Available tools", "Tool permissions", "Project assignments", "Connection status", "Invocation history"] },
  { name: "Logs and Diagnostics", tagline: "Stop searching through disconnected consoles.", body: "Search, filter, export, attach logs to notes, or turn errors directly into audit findings.", items: ["Base44 function logs", "Local development output", "CLI operations", "MCP tool calls", "Connector events", "Browser console errors", "Failed network requests", "Audit activity", "Testing activity"] },
  { name: "Notes and Decisions", tagline: "Keep project knowledge beside the project.", body: "Attach notes directly to projects, entities, functions, files, tests, logs, and deployments. No more searching through messages and documents to remember why a decision was made.", items: ["Development notes", "Client requirements", "Technical decisions", "Bugs", "Deployment notes", "Audit findings", "Test observations", "Meeting notes", "Future improvements"] },
];

export const STEPS = [
  { title: "Connect your Base44 account", body: "Authorize the Base44 CLI and MCP connection through the secure browser-based login process. Base44 Desktop discovers the applications your account can access without storing your Base44 credentials in the cloud." },
  { title: "Import or link your projects", body: "Browse existing Base44 applications, connect local backend projects, create a new standalone BaaS project, or eject an editor application into an independent codebase. Each project is automatically classified based on the features it supports." },
  { title: "Build, test, audit, and deploy", body: "Open the project workspace to manage resources, improve prompts, inspect logs, run tests, review findings, and prepare a safe deployment plan. Everything stays organized around the project you are working on." },
];

export const WORKFLOW = [
  { title: "Discover", body: "Connect your account and organize every Base44 application and local backend project." },
  { title: "Understand", body: "See resources, permissions, integrations, local files, tests, and deployment state." },
  { title: "Build", body: "Edit files, manage backend resources, configure APIs, and reuse proven prompts." },
  { title: "Verify", body: "Run audits, browser tests, security checks, and production-readiness scans." },
  { title: "Deploy", body: "Review every proposed change and deploy with clear warnings before destructive actions." },
  { title: "Improve", body: "Save findings, notes, tests, prompts, and project knowledge for the next release." },
];

export const USE_CASES = [
  { title: "For Freelance Base44 Developers", body: "Manage multiple client projects without mixing prompts, notes, local folders, integrations, or deployment history. Deliver better handoffs, clearer reports, and more consistent results." },
  { title: "For Development Agencies", body: "Create standardized workflows across your team. Share prompt libraries, audit templates, testing systems, and project standards while keeping client data separated." },
  { title: "For Base44 App Owners", body: "Understand what is happening inside your application without relying on vague status updates. See open risks, failed tests, recent changes, and production-readiness progress in one place." },
  { title: "For Technical Teams", body: "Connect Base44 projects to structured local development, Git workflows, external APIs, MCP servers, testing, and deployment controls. Build with the speed of Base44 without giving up engineering discipline." },
  { title: "For Security and QA Reviews", body: "Run repeatable audits and user journeys across multiple projects. Track findings from discovery through remediation and verification." },
];

export const WHY_DESKTOP = [
  { title: "Work directly with local code", body: "Open, search, validate, compare, and safely edit trusted project folders." },
  { title: "Use secure system authentication", body: "Keep CLI and MCP credentials inside approved local credential storage." },
  { title: "Run real browser tests", body: "Launch isolated browsers, capture traces, and simulate complete user journeys." },
  { title: "Stream logs and commands", body: "Watch local and remote processes from one interface." },
  { title: "Keep working offline", body: "Continue using local projects, notes, prompts, and files when internet access is interrupted." },
];

export const SAFETY = [
  { title: "Credentials stay protected", body: "Base44 credentials, OAuth tokens, API keys, and project secrets are not stored in the desktop application's cloud database." },
  { title: "AI changes remain reviewable", body: "AI-generated code and configuration changes appear as patches before they touch your project." },
  { title: "Destructive operations require confirmation", body: "Entity removals, connector removals, secret deletion, function pruning, and risky deployments cannot run silently." },
  { title: "Project access remains restricted", body: "The application can only access folders that you explicitly approve." },
  { title: "Sensitive information is masked", body: "Secrets are removed from logs, AI context, command history, and exported reports." },
  { title: "Every important action is recorded", body: "Track commands, deployments, audits, tests, resource changes, and confirmations through a searchable activity timeline." },
];

export const COMPARISON = [
  ["Projects spread across multiple workspaces and tabs", "Every project organized in one dashboard"],
  ["Prompts stored in random documents and messages", "Searchable, versioned Prompt Vault"],
  ["Manual security reviews", "Repeatable evidence-backed audits"],
  ["Testing limited to clicking through the app", "Automated personas and user journeys"],
  ["Logs spread across terminals and dashboards", "Unified searchable diagnostics"],
  ["APIs and connectors tracked manually", "Central integration registry and scope review"],
  ["Deployment commands run without a complete impact view", "Preflight checks and deployment plans"],
  ["Important decisions buried in chat history", "Project-linked notes and activity"],
  ["Repeated setup for every project", "Reusable workflows, templates, and standards"],
];

export const OUTCOMES = [
  "Find projects faster.", "Reuse proven prompts.", "Understand backend resources.", "Catch permission problems earlier.",
  "Test complete user journeys.", "Reduce deployment mistakes.", "Troubleshoot issues faster.", "Keep project knowledge organized.",
  "Standardize work across a team.", "Deliver clearer reports to clients.", "Move from prototype to production with confidence.",
];

export const FAQS = [
  { q: "What is Base44 Desktop?", a: "Base44 Desktop is an independent Electron desktop application that organizes Base44 projects, local backend code, prompts, audits, integrations, testing, logs, notes, and deployment workflows inside one development environment." },
  { q: "Is Base44 Desktop part of Base44?", a: "No. Base44 Desktop is an independent developer tool created for people who build and manage applications using Base44." },
  { q: "Does it replace the Base44 editor?", a: "No. It complements the Base44 platform. You can continue using the Base44 editor while using Base44 Desktop to organize projects, manage standalone backend resources, run audits, perform testing, maintain prompts, and coordinate local development workflows." },
  { q: "Can it access my current Base44 projects?", a: "Base44 Desktop is designed to connect to the user's authorized Base44 account and discover the applications available to that account through supported Base44 connections. Access remains limited to projects the connected user is authorized to use." },
  { q: "Can I manage Base44 Backend as a Service projects?", a: "Yes. Base44 Desktop is designed to manage standalone Base44 BaaS projects, including local resources such as entities, functions, agents, connectors, authentication configuration, secrets, and automations. Available capabilities may differ between normal Base44 editor applications and standalone backend projects." },
  { q: "Does Base44 Desktop store my Base44 password?", a: "No. Base44 authentication should be completed through the supported browser, CLI, and OAuth connection flows. Sensitive credentials remain in approved local credential storage or are managed by the Base44 CLI." },
  { q: "Can it modify my application automatically?", a: "Not without your approval. AI-generated edits are shown as reviewable patches. Operations that can remove resources, expose data, delete secrets, or affect production require explicit confirmation." },
  { q: "Can it run security audits?", a: "Yes. Base44 Desktop is designed to check entity permissions, authentication, role access, secrets, functions, connectors, routes, application behavior, and production-readiness risks. Findings include evidence and recommended verification steps." },
  { q: "Can it test the application like a real user?", a: "Yes. The Agent User Testing system can run browser-based journeys using defined personas, goals, devices, permissions, and expected outcomes. It can capture screenshots, errors, failed requests, dead ends, and unexpected application behavior." },
  { q: "How much does Base44 Desktop cost?", a: "The Base44 Desktop application is a free download. Pro Access — which unlocks the complete Prompt Vault, security and production audits, agent user testing, and the full Agent Skills library — is available as a launch special for a one-time payment of $15 with lifetime access. On August 1, 2026, pricing changes to $25 per month." },
  { q: "Will it work offline?", a: "Local features such as files, notes, cached prompts, project metadata, and previously downloaded results can remain available offline. Features that require Base44, MCP, APIs, cloud synchronization, or remote logs require an internet connection." },
  { q: "Which operating systems will be supported?", a: "The planned desktop application targets Windows and macOS first, with Linux support evaluated based on runtime and packaging compatibility." },
  { q: "When will Base44 Desktop be available?", a: "Base44 Desktop is currently being developed. Join the early-access list to receive launch updates and access opportunities." },
];