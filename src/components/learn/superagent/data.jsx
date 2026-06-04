import {
  Database, Boxes, Sparkles, Workflow, FileText, Globe, Mail, Brain,
} from "lucide-react";

export const HERO_TAGS = [
  "Tool-using AI operator",
  "Attached to one app",
  "Skill-driven automation",
  "JS, Python, Bash",
  "Scoped write access",
  "Read broad, write local",
];

export const TRIGGERS = ["Scheduled time", "Entity create", "Entity update", "Entity delete"];
export const HANDLER = ["Full logic & branching", "API calls & emails", "Skill chaining", "Write-backs & logging"];

export const READ_SCOPE = ["Attached app data", "Other owned apps", "Cross-app reporting"];
export const WRITE_SCOPE = ["Entity CRUD", "Schema changes", "Automations"];

export const CAPABILITIES = [
  { icon: Database, title: "App Data", items: ["Read entity data from attached app", "Read data from other owned apps", "Paginate through large datasets", "~100 records per call"] },
  { icon: Boxes, title: "Schema & Entities", items: ["Create & update entity schemas", "Add or remove fields", "Full entity CRUD in attached app", "Modify entity structure on the fly"] },
  { icon: Sparkles, title: "Skills", items: ["Write in JavaScript, Python, or Bash", "Run skills in sandbox environment", "Chain multiple skills together", "Persist skills in .agents/skills/"] },
  { icon: Workflow, title: "Automations", items: ["Create automations in attached app", "Schedule-based triggers", "Entity event triggers", "Trigger skills and workflows"] },
  { icon: FileText, title: "Files", items: ["Read & write files in sandbox", "Parse uploaded or generated files", "Generate reports and exports", "Upload as public or private"] },
  { icon: Globe, title: "External Services", items: ["Browse & scrape the web", "Call public and authenticated APIs", "Use connected OAuth tokens", "LinkedIn, Google, Slack, Reddit…"] },
  { icon: Mail, title: "Communication", items: ["Recipient must be a registered app user", "Cannot email external addresses", "Generate images", "Log results to app entities"] },
  { icon: Brain, title: "Memory", items: ["Persist memory across sessions", "Save facts to memory files", "Reuse saved memory later", "Explicit save is most reliable"] },
];

export const BOUNDARIES = [
  { title: "Cross-App Control", items: ["Cannot modify another app's agent", "Cannot create schemas in another app", "Cannot create automations in another app", "Cannot write records into another app"] },
  { title: "Platform Access", items: ["Cannot access Base44 billing", "Cannot access workspace settings", "Cannot access account settings", "Cannot see private dashboard internals"] },
  { title: "Security Admin", items: ["Cannot modify RLS settings", "Cannot modify user role systems", "Cannot change access permissions", "Cannot harden your permission model"] },
  { title: "Runtime Boundaries", items: ["Cannot create native backend functions", "Cannot email non-app users", "Cannot post as you without credentials", "Memory needs explicit save to persist"] },
];

export const USE_CASES = [
  { title: "Anomaly Flagging", desc: "Detect unusual activity, summarize trends on schedule, flag records for review." },
  { title: "Event-Driven Pipelines", desc: "Validate on create or update, enrich with computed fields, route to correct status." },
  { title: "Scoring & Classification", desc: "Score quality, urgency, or risk. Add reasons for scores. Standardize incoming data." },
  { title: "Support Triage", desc: "Categorize by issue type, detect urgency or frustration, suggest replies." },
  { title: "Content Generation", desc: "Generate drafts from data, rewrite for different channels, create summaries." },
  { title: "Research & Enrichment", desc: "Browse public sources, pull facts from APIs, add missing context." },
  { title: "Scheduled Reports", desc: "Daily, weekly, monthly summaries. Highlight what changed. Management-friendly outputs." },
  { title: "File Processing", desc: "Extract text and data, parse structured files, generate exports." },
  { title: "Smart Alerting", desc: "Add context to alerts, filter duplicate noise, route to right destination." },
  { title: "External Integration", desc: "Authenticated API calls, sync with outside services, push results externally." },
  { title: "Data Auditing", desc: "Find missing or malformed data, detect duplicates, check workflow behavior." },
  { title: "Human-in-the-Loop", desc: "Highlight issues needing attention, prepare operator digests, reduce manual review work." },
];

export const PATTERNS = [
  { name: "Trigger → Analyze → Write Back", items: ["Classification", "Validation", "Routing", "Scoring"] },
  { name: "Trigger → Analyze → Notify", items: ["Support", "Monitoring", "Admin alerts", "Failure notifications"] },
  { name: "Schedule → Scan → Summarize", items: ["Daily reports", "Weekly reviews", "Health checks", "Trend summaries"] },
  { name: "Input → Enrich → Store", items: ["Leads", "Profiles", "Content metadata", "Research records"] },
  { name: "Upload → Parse → Structure", items: ["CSV imports", "Reports", "Documents", "Logs"] },
];

export const LOW_RISK = ["Daily summary reports", "Ticket categorization", "Lead scoring", "File summarization", "Missing data audits", "Alerting on failed jobs"];
export const HIGH_RISK = ["Automatic schema changes", "Field removals", "Record deletions", "Bulk record modifications", "External posting without approval"];

export const SECURITY = [
  { title: "Default Access", items: ["All entity data in attached app", "Secrets in .agents/.env", "Connected OAuth tokens", "Sandbox filesystem"], tone: "ok" },
  { title: "Requires Setup", items: ["OAuth connectors", "Environment secrets", "Other app access via app ID", "Email sending to app users"], tone: "warn" },
  { title: "Cannot Access", items: ["Other users' private apps", "Other workspaces' data", "Base44 billing or account settings", "Platform internals"], tone: "bad" },
];

export const LIMITS = [
  { stat: "~2–3 min", title: "Skill Timeout", desc: "Skills that run longer risk being interrupted. Break large jobs into smaller steps." },
  { stat: "~100", title: "Records Per Call", desc: "Larger datasets require manual pagination — read, process, advance cursor, repeat." },
  { stat: "Chunk", title: "Long-Running Jobs", desc: "Use an entity to track status, last cursor, error count, and final output." },
];

export const RULES = [
  "Treat the agent as a privileged system operator",
  "Never allow schema edits without a preview",
  "Add logging to every important skill",
  "Add error handling to every important skill",
  "Assume external APIs can fail at any time",
  "Use entities to store job status, progress, errors, and output",
  "Save important instructions explicitly to memory",
  "Organize reusable skills cleanly in .agents/skills/",
  "Review secrets and OAuth usage carefully",
  "Test small before testing big",
];