import { slugify } from "./base44HubData";

// Supplemental deep-dive topics merged into the fetched knowledge base
const RAW = [
  {
    num: 43,
    title: "Automations (Scheduled, Entity & Webhook Triggers)",
    category: "Automation & Connectors",
    body: `Automations run backend functions automatically — no user action required. They are the "when X happens, do Y" engine of Base44.

### The four automation types

| Type | Trigger | Typical use |
|------|---------|-------------|
| **Scheduled** | Cron or interval (min. 5 minutes) | Nightly cleanup, daily reports, reminder emails |
| **Entity** | Record create / update / delete | Notify on new order, sync on status change |
| **Connector** | Webhook events from OAuth integrations | New Slack message, Gmail arrival, Calendar change |
| **In-app agent** | App user starts a new agent conversation | Create a support ticket from a new chat |

### Scheduled automations

- **Simple:** repeat every N minutes/hours/days — e.g. every 5 minutes, daily at 09:00.
- **Weekly:** pick days of the week (0=Sunday, 6=Saturday) plus a start time.
- **Monthly:** pick a day of the month (e.g. the 1st or 15th).
- **Cron:** standard cron expressions — \`0 9 * * 1-5\` = 9am on weekdays. Cron runs in **UTC**; simple schedules auto-convert from your local timezone.
- **One-time:** fire once at a specific datetime.
- **Ends:** never (default), on a date, or after N runs.

### Entity automations

The backend function receives a payload:

\`\`\`js
{
  event: { type: "create" | "update" | "delete", entity_name, entity_id },
  data: { /* current entity data */ },
  old_data: { /* previous data — update events only */ },
  changed_fields: ["status", "amount"],   // top-level fields that changed
  payload_too_large: false                 // true if data exceeded 200KB (data is null — fetch it yourself)
}
\`\`\`

**Trigger conditions** pre-filter events so your function only runs when it matters. Field paths use \`data.<field>\`, \`old_data.<field>\`, or \`changed_fields\`:

> Only fire when an order's status *changes to* "completed": check \`changed_fields\` **contains** "status" AND \`data.status\` **equals** "completed".

### Connector automations

- The connector must be authorized first.
- Each provider has its own payload structure — read the provider's webhook guide before writing the handler.
- Examples: Slack \`message\` / \`reaction_added\`, Gmail \`mailbox\`, Google Drive \`file.update\`, Google Calendar \`events\`, Wix order events, Outlook \`created\`.
- Condition field paths go **directly into the raw webhook payload** (e.g. \`event.channel\`) — no \`data.\` prefix.
- If the user gives you a human-readable name (like a Slack channel) but the payload carries an internal ID, resolve the ID first — never guess.

### Best practices

- Create the **backend function first**, then the automation that calls it.
- Prefer **connector webhooks over scheduled polling** for reacting to external events — realtime and cheaper.
- Automation-invoked functions run without a user session — use the **service role** and validate the payload.
- Pause instead of delete: automations can be toggled off and re-enabled later.
- Give automations descriptive names so logs stay readable.`,
  },
  {
    num: 44,
    title: "Super Agent (The Base44 Builder Agent)",
    category: "AI, Agents & Skills",
    body: `The "Super Agent" is the AI builder you chat with in the Base44 editor — the agent that writes your entities, pages, functions, and automations. Understanding how it operates makes your prompts dramatically more effective.

### What it can do

- Create and edit every file type: pages, components, entity schemas, backend functions, agent configs, workflows.
- Run code in a sandbox to read/write your database and call connected APIs.
- Test backend functions and read their logs, then fix and redeploy automatically.
- Generate AI images and videos for your app.
- Search the web, fetch pages, and read files you upload to chat.
- Request OAuth authorizations, secrets, and npm packages (with your approval).

### What it deliberately won't do

- Implement auth backend logic — the platform owns tokens, sessions, and verification.
- Use npm packages outside the installed list (they break the build).
- Store large blobs in entity fields (files go to storage, URLs go in fields).
- Hand out service-role keys — elevation happens only inside backend functions.

### Its security model

- Frontend code runs as the **logged-in user** — entity access respects RLS rules.
- Backend functions authenticate the caller with \`base44.auth.me()\` and only use \`asServiceRole\` when business logic justifies it.
- Webhook endpoints validate signatures or shared secrets before trusting a request.
- Admin-only functions verify \`user.role === 'admin'\` and return 403 otherwise.

### How to work with it effectively

1. **One coherent feature per message.** Many features at once → it builds a core fully and defers the rest.
2. **Be concrete about WHERE and WHAT.** "Add a button" forces a clarifying question; "Add an Export CSV button to the orders table header" gets built immediately.
3. **Report bugs by behavior**, not by guessed cause: "clicking Save on the profile page does nothing" beats "I think the API is broken."
4. **It reads before it writes.** It inspects existing code first — reference your existing pages and components by name.
5. **Scope discipline is built in.** It won't add extra sections, pages, or features you didn't ask for — if you want more, say so.

> ### Want the full deep dive?
> The [SuperAgent Explained](/learn/superagent) guide covers the complete mental model, capabilities, boundaries, and automation patterns.`,
  },
  {
    num: 45,
    title: "AI Custom Instructions",
    category: "AI, Agents & Skills",
    body: `Custom instructions are standing rules the AI builder follows on **every** message — set once in your app's dashboard settings, applied forever. They are the highest-leverage drift-control tool on the platform.

### What to put in them

| Category | Example rule |
|----------|-------------|
| **Brand & design** | "All AI images use a deep navy background with orange-to-amber gradient accents, flat vector style, no text." |
| **Analytics** | "Every new page must include GA4 event tracking." |
| **SEO** | "New public pages get an SEO pass: optimized meta title/description and a custom OG image." |
| **Coding standards** | "Keep components under 50 lines; extract sections into focused files." |
| **Content voice** | "All marketing copy is outcome-focused and pain-point driven, short paragraphs." |
| **Process** | "Always show me a plan before builds that touch more than three files." |

### Rules for writing good instructions

- **Be specific and testable.** "Make it look nice" does nothing; "use the token classes from the design system, never hardcoded hex values" is enforceable.
- **Keep them evergreen.** Instructions apply to every future message — don't put one-off tasks in them.
- **Prioritize.** A handful of high-impact rules beats a wall of text the model has to weigh on every turn.
- **Include exact values.** Hex codes, font names, event naming conventions, URL patterns — precision removes guesswork.
- **State prohibitions explicitly.** "Never change pricing logic without asking" prevents well-intentioned drift.

### Custom instructions vs. other controls

- **Custom instructions** — standing rules for the AI builder (your app's dashboard).
- **Workspace skills** — loadable step-by-step playbooks for specific task types (security audit, mobile optimization, etc.).
- **Agent instructions** — the \`instructions\` field inside an in-app agent's config, governing how *that agent* talks to *your app's users*.

> ### Get free drift-control prompts
> The [AI Controls](/learn/ai-controls) library has copy-paste guardrail prompts — scope locks, regression checklists, and change reports.`,
  },
  {
    num: 46,
    title: "In-App Agent Playbook (Build a Production Agent)",
    category: "AI, Agents & Skills",
    body: `A practical end-to-end recipe for shipping an in-app AI agent your users can actually talk to.

### Step 1 — Define the agent

An agent is a JSON config file in \`base44/agents/\`:

\`\`\`jsonc
{
  "description": "Support agent that answers questions and manages tickets",
  "instructions": "You are a friendly support agent. Look up the user's tickets before answering. Never reveal other users' data.",
  "tool_configs": []
}
\`\`\`

Write \`instructions\` like an employee handbook: tone, what to do first, hard boundaries.

### Step 2 — Grant tools (least privilege)

Agents act as the current app user but start with **zero** data access. Grant only what the role needs:

\`\`\`json
[
  { "entity_name": "Ticket", "allowed_operations": ["read", "create", "update"] },
  { "entity_name": "FAQ", "allowed_operations": ["read"] },
  { "function_name": "escalateTicket", "description": "Escalate a ticket to a human" }
]
\`\`\`

- Entity operations: \`read\`, \`create\`, \`update\`, \`delete\` only.
- Backend function tools let the agent trigger real workflows.
- Every agent has built-in web search — don't define it.

### Step 3 — Build the chat UI

Agents are only usable from the dashboard until you build a UI:

\`\`\`js
// Create + load conversations
const conv = base44.agents.createConversation({ agent_name: "support", metadata: { name: "New chat" } });
const list = base44.agents.listConversations({ agent_name: "support" });

// Send messages (files supported)
base44.agents.addMessage(conv, { role: "user", content: "Where's my order?" });

// Stream updates
useEffect(() => {
  const unsub = base44.agents.subscribeToConversation(conversationId, (data) => setMessages(data.messages));
  return () => unsub();
}, [conversationId]);
\`\`\`

Render assistant \`content\` as markdown and show \`tool_calls\` with status indicators (pending / running / completed / failed).

### Step 4 — Optional channels

Agents can live on WhatsApp and Telegram — set \`whatsapp_greeting\` / \`telegram_greeting\` in the config and drop connect links in your UI via \`base44.agents.getWhatsAppConnectURL('agent_name')\`.

### Step 5 — React to conversations

Pair the agent with an **in-app agent automation** (\`conversation_started\`) to log leads, create tickets, or notify your team the moment a user starts chatting.

### Production checklist

- Instructions include explicit "never do" boundaries.
- Tool permissions are minimal — no delete unless required.
- UI handles loading, streaming, tool-call errors, and empty conversation lists.
- Sensitive operations route through backend functions that re-validate the user.`,
  },
];

export const EXTRA_SECTIONS = RAW.map((s) => ({ ...s, slug: slugify(s.title) }));