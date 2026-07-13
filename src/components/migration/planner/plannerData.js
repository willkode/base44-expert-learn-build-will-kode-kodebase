// Content data for the Migration Planner landing page.

export const baasDependencies = [
  "Authentication","Database entities","Backend functions","File storage","Email delivery","AI integrations",
  "Realtime subscriptions","Automations","Workflows","OAuth connectors","Payments","User roles and permissions",
  "Analytics and application logs",
];

export const journeySteps = [
  {
    title: "Connect Your Repository",
    text: "Connect GitHub with read-only access or upload an exported ZIP. Your code, your authorization — we only analyze repositories you own or are authorized to manage.",
  },
  {
    title: "Run Your Assessment",
    text: "The scanner works through your application structure and finds every:",
    items: ["Base44 entities","Backend functions","Authentication flows","External integrations","Payment systems","File storage","Realtime features","Scheduled jobs","Entity automations","AI features","Security risks","Hardcoded dependencies","Migration complexity"],
  },
  {
    title: "See Your Free Preview",
    text: "Pay nothing to know where you stand. Your free summary includes:",
    items: ["Readiness score","Complexity level","Number of entities","Number of backend functions","Integrations detected","Authentication dependencies","Payment and realtime features","Important technical findings","Recommended migration direction","Preliminary project estimate"],
  },
  {
    title: "Unlock the Full Plan for $25",
    text: "One payment unlocks your complete technical migration roadmap — saved to your account forever, so you can return to it any time.",
  },
  {
    title: "DIY or Hire Us",
    text: "Use the roadmap yourself, hand it to your developer, or have us do the whole migration. You can:",
    items: ["Pay the migration deposit","Pay the full quote","Request a manual review","Schedule a call with Will Kode"],
  },
];

export const previewItems = [
  "Application name","Repository and branch","Files reviewed","Entities detected","Backend functions detected",
  "Integrations detected","Authentication methods detected","Payment features detected","Realtime functionality detected",
  "Automations detected","Security finding count","Migration readiness score","Overall complexity level","Preliminary migration cost range",
];

export const reportSections = [
  { title: "Executive Summary", intro: "A plain-language overview of your application, migration difficulty, major risks, recommended architecture, estimated cost, and projected timeline." },
  { title: "Architecture Inventory", intro: "A complete breakdown of your current:", items: ["Frontend","Entities","Backend functions","Authentication","Payments","Storage","Integrations","Realtime systems","Workflows","Automations","AI features"] },
  { title: "Base44 Dependency Map", intro: "See exactly which parts of your app still rely on Base44 at runtime. The report identifies dependencies involving:", items: ["base44.auth","base44.entities","base44.functions","base44.integrations","base44.agents","Base44 storage","Base44 realtime subscriptions","Base44 workflows","Hosted authentication","Base44-specific URLs and environment settings"] },
  { title: "Recommended Technology Stack", intro: "Receive a stack recommendation based on your application. Possible recommendations include:", items: ["Supabase","Node.js and PostgreSQL","Hybrid architecture","Custom infrastructure","Managed authentication","Cloudflare R2 or Amazon S3","Socket.IO or Supabase Realtime","Background workers or workflow orchestration"], outro: "The report explains why each technology was selected." },
  { title: "Database Migration Plan", intro: "Your report includes:", items: ["Entity conversion plan","Field mapping","Relationship mapping","Index recommendations","Built-in Base44 field handling","Undeclared field findings","Data transformation requirements","User record migration","Validation requirements","Backup and rollback recommendations"] },
  { title: "Authentication Migration Plan", intro: "Receive a complete plan for replacing Base44 authentication, including:", items: ["Registration","Login","OTP verification","Password recovery","Password reset","Session handling","Existing-user migration","Role migration","OAuth migration","Administrator access","Security controls"] },
  { title: "Backend Function Migration Plan", intro: "Every detected function is categorized and reviewed. Categories may include:", items: ["Payments","Notifications","Email","SMS","Authentication","Administration","AI","Reporting","Webhooks","Scheduled jobs","Entity-change automations","External API integrations","Business logic"], outro: "Each function includes its current purpose, dependencies, recommended replacement, migration difficulty, risks, and testing requirements." },
  { title: "Integration Migration Plan", intro: "The report documents every detected integration and explains how to replace it. Examples include:", items: ["Stripe","Square","Resend","SendGrid","Twilio","OpenAI","Anthropic","Google APIs","Slack","GitHub","Cloudflare","Amazon S3","Supabase","Custom REST APIs"] },
  { title: "File Storage Plan", intro: "Receive recommendations for migrating:", items: ["Public files","Private files","Uploaded documents","Images","Signed URLs","Access-controlled content","Existing file references"] },
  { title: "Realtime and Automation Plan", intro: "The report identifies how to replace:", items: ["Entity subscriptions","Chat","Live notifications","Scheduled jobs","Delayed workflows","Entity-change triggers","Webhook automations","AI agent conversations"] },
  { title: "Security Review", intro: "The planner checks for risks such as:", items: ["Hardcoded secrets","Missing authorization checks","Unsafe service-role usage","Unprotected administrator actions","User records without ownership controls","Missing webhook verification","Hardcoded Base44 URLs","Sensitive information exposed to the frontend","Functions trusting user-supplied IDs","Missing route protection"], outro: "Sensitive values are automatically redacted." },
  { title: "Phased Migration Roadmap", intro: "Receive a step-by-step implementation sequence covering:", items: ["Discovery and backup","Infrastructure setup","Database migration","Authentication migration","Backend function migration","Integration migration","Data and file migration","Testing","Deployment","Monitoring and handoff"], ordered: true },
  { title: "Testing Checklist", intro: "Your report includes testing requirements for:", items: ["Registration","Login","Password reset","Session restoration","User roles","Administrator permissions","Entity access","Forms","File uploads","Payments","Webhooks","Realtime updates","Automations","Mobile layouts","Error handling","Production deployment"] },
  { title: "Professional Migration Quote", intro: "The planner generates a preliminary quote based on your application's complexity. Professional migrations start at $2,000. Your quote may include:", items: ["Base migration setup","Entity migration","Backend function migration","Authentication replacement","Data migration","File migration","Payment integration","Realtime functionality","Automations","AI features","Security remediation","Deployment","Testing","Documentation","Handoff"], outro: "Every line item explains why it was included." },
];

export const deterministicItems = [
  "Entity files","Function files","SDK calls","Authentication methods","Environment variables","Integrations",
  "Webhooks","Storage calls","Realtime subscriptions","Payment logic","Security patterns",
];

export const serviceItems = [
  "Standalone backend development","PostgreSQL database setup","Supabase migration","Authentication replacement",
  "Backend function migration","Payment migration","File storage migration","Realtime infrastructure","Workflow migration",
  "AI integration migration","Existing data migration","Security remediation","Testing","Production deployment","Documentation and handoff",
];

export const postReportActions = ["Review your quote","Pay the project deposit","Pay in full","Request a manual quote review","Schedule a consultation"];

export const useCases = [
  "Customer portals","SaaS platforms","Marketplaces","CRMs","Internal business tools","Membership platforms",
  "Booking systems","Payment applications","AI-powered tools","Realtime messaging","Administrative dashboards",
  "Mobile-ready applications","Multi-role applications","Multi-tenant systems",
];

export const whyItems = [
  { title: "Underestimating the Project", text: "A \"simple\" repo can hide heavy backend dependencies. Find them before development starts — not after your budget is spent." },
  { title: "Rebuilding What Already Works", text: "Most Base44 frontends can be kept. Your report shows exactly what stays and what must change, so you only pay to replace what actually needs replacing." },
  { title: "Losing Data Mid-Migration", text: "Export, transform, import, validate, and roll back with a plan — instead of a prayer. Your report spells out every data requirement." },
  { title: "Shipping Old Security Holes", text: "Authorization gaps, exposed secrets, and unverified webhooks get flagged before they're reproduced in your new backend." },
  { title: "Getting a Made-Up Quote", text: "Your estimate is built from detected entities, functions, integrations, and risks. Defensible and explainable — not arbitrary." },
];

export const trustItems = [
  "We use read-only access to analyze the repositories you authorize.",
  "We do not require your Base44 password.",
  "We do not scrape the Base44 editor.",
  "We do not access undocumented Base44 systems.",
  "We do not automatically modify your repository during the assessment.",
  "We do not publicly display your source code.",
  "You can disconnect GitHub access after the scan.",
];

export const legalityExclusions = [
  "Scraping Base44","Bypassing plan restrictions","Circumventing platform security","Accessing undocumented systems",
  "Reverse engineering Base44's proprietary platform","Analyzing another person's repository without permission",
];

export const finalCtaItems = [
  "A free readiness preview","A complete dependency map","A recommended target architecture","A database migration plan",
  "An authentication migration plan","A backend function roadmap","An integration plan","A security review",
  "A phased implementation plan","A testing checklist","A preliminary professional quote",
];