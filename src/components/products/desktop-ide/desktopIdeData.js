export const HERO_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a91fa8956_Screenshot2026-08-18080311.png";
export const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/5579b0a4d_generated_image.png";

export const SHOTS = {
  home: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a91fa8956_Screenshot2026-08-18080311.png",
  editor: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/4786d3010_Screenshot2026-08-18080325.png",
  migrate: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/1e0a3d6be_Screenshot2026-08-18080337.png",
  audit: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/463ef0b15_Screenshot2026-08-18080346.png",
  prompt: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/fe547fc1e_Screenshot2026-08-18080354.png",
};

// Set this to the .exe download URL when available. While empty, the download
// button sends visitors to the launch list instead.
export const DOWNLOAD_URL = "";

export const HERO_SPECS = [
  { label: "Platform", value: "Windows 10 / 11 · x64" },
  { label: "Installer", value: "80 MB · per-user" },
  { label: "Requires", value: "A Base44 account" },
  { label: "Price", value: "$25 lifetime access" },
];

export const IDEA = [
  "Base44 is excellent at getting an app built. What it does not give you is a place to sit with that app on your own computer — to read the code it generated, run it locally, review it properly, and decide where it should live.",
  "Base44 Desktop IDE is that place. It signs in to your real account, lists every app you own, and opens any one of them into a workspace with five tabs: the Base44 editor itself, a local copy of the source, a preview server, backend logs, and an optional migration flow. Nothing is simulated and nothing is a mock — you are looking at your live account throughout.",
  "It never modifies your Base44 app. Every operation is either read-only or writes to a folder you choose on your own disk. Your app stays in Base44, editable in Base44, for as long as you want it there.",
];

export const MODES = [
  {
    badge: "Default mode",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/9d2b72b43_generated_image.png",
    title: "The person who just builds things",
    body: "You want your apps in a grid, one click into the editor, and an AI that will tell you honestly whether your app is safe to put in front of customers. You never need to know what a CLI is. This is what the app looks like out of the box.",
  },
  {
    badge: "Advanced mode",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/594bb8598_generated_image.png",
    title: "The developer who wants the exits",
    body: "You want the source on disk, a local dev server, backend function logs, a git-tracked copy you can diff, deploy configuration for your own host, and a way to pull Base44's newer changes into it later. One toggle reveals all of it.",
  },
];

export const SURFACES = [
  { name: "Home", body: "Your apps as tiles with artwork, split by kind, one click into the editor." },
  { name: "My apps", body: "The full searchable table — app ID, last modified, source status, migration status — with filters for Apps, Superagents, Games, editor-managed, externally linked, and already migrated." },
  { name: "Workspaces", body: "Browse and switch workspaces, mark favourites, see recents.", advanced: true },
  { name: "Manual entry", body: "Paste an app ID directly, for anything discovery cannot see." },
];

export const TABS = [
  { name: "Editor", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/6c9a0a1d9_generated_image.png", body: "The genuine Base44 editor, embedded in the window — not a link that throws you into a browser. It keeps its own signed-in session between launches, and stays loaded in the background when you switch tabs so you never lose your place mid-thought." },
  { name: "Local code", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/248977ea0_generated_image.png", body: "A read-only file tree and viewer with line numbers over the copy on your disk. Read what Base44 actually generated, with no risk of editing the wrong copy." },
  { name: "Preview", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/0533eb150_generated_image.png", body: "Installs dependencies and runs the app locally against the real Base44 backend — either the hot-reloading dev server or the production build, which is what actually ships." },
  { name: "Logs", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c9b7dc8f3_generated_image.png", body: "Backend function logs for the draft or published deployment, filterable by text, without opening the dashboard." },
  { name: "Migrate", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/bb94b0573_generated_image.png", body: "Marked optional, because it is. The whole export-and-rehost flow lives here and nowhere else, so it never gets in the way of ordinary work." },
  { name: "Prompt and Audit menus", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/763e67d7d_generated_image.png", body: "Two dropdowns beside the tabs that push work into the editor's chat: a saved prompt, or a full audit. Rendered as native menus so they open cleanly above the embedded editor." },
];

export const AUDITS = [
  { name: "Security", body: "Secrets exposed to the browser, backend functions trusting client-supplied values, injection risks, over-permissive endpoints, missing rate limits." },
  { name: "Permissions and data rules", body: "Per-entity read, create, update and delete reality against intent; records readable by the wrong user; fields like role, plan or balance that should never be client-writable." },
  { name: "Authentication", body: "Routes that should require login but do not, client-only access checks with no backend equivalent, broken signup and reset flows, abusable post-login redirects." },
  { name: "Backend functions", body: "Missing authorization, unvalidated input, unhandled failures around external calls, N+1 lookups, non-idempotent operations called as if they were." },
  { name: "Connectors", body: "Credentials stored unsafely, webhooks that do not verify their sender, calls with no timeout or retry, integrations still wired up but unused." },
  { name: "Performance", body: "Over-fetching, missing pagination, work repeated every render, blocking calls on first paint, sequential backend work that could run concurrently." },
  { name: "Code quality", body: "Duplicated logic that has drifted, error paths that swallow failures, dead code, state that can desynchronise." },
  { name: "Desktop UI", body: "Broken layouts, poor contrast, keyboard-unreachable controls, missing loading and error states, destructive actions with no confirmation." },
  { name: "Mobile UI", body: "Horizontal overflow, tap targets too small or too close, fixed elements hidden under the keyboard, hover-only interactions with no touch path." },
  { name: "Migration readiness", body: "Hardcoded Base44 URLs and origins, auth flows that break off-platform, anything depending on Base44 hosting behaviour a static host will not provide." },
];

export const MIGRATION_STEPS = [
  { title: "Download the app code", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/19d2f0443_generated_image.png", body: "Fetches the export archive. A plain read that creates nothing on the Base44 side." },
  { title: "Check what can move", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/fbc6c3e81_generated_image.png", body: "Inventories entities, functions, agents, connectors and auth methods, and reports anything that will not survive the move as a blocker, warning or note." },
  { title: "Check the backend is reachable", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/de07aca47_generated_image.png", body: "Confirms the original backend answers before any files are written." },
  { title: "Plan the source changes", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/ea9e91e36_generated_image.png", body: "Works out every edit needed to point the copy at your existing backend — and shows you the full diff before a single byte lands." },
  { title: "Plan the host configuration", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/53c5fca17_generated_image.png", body: "Generates deploy config for Vercel, Netlify, Cloudflare Pages or a plain static host." },
];

export const PROOF = [
  { title: "Origin probes", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/19fad89e8_generated_image.png", body: "Confirms Base44 is reachable, that the backend accepts simple and preflighted requests from your new origin, that an Authorization header survives preflight, that a JSON write is accepted, and how cookie-bearing cross-origin requests behave." },
  { title: "Twelve validation checks", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/e615244e2_generated_image.png", body: "Project structure, entity schemas, auth configuration, backend functions, connector configuration, environment variables, broken imports, production build, routes, the Base44 connection, the logged-in user, and the published URL." },
  { title: "Update sync", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a31c8f801_generated_image.png", body: "Pulls newer Base44 code into an already-migrated project as a git merge, reporting changed files, incoming commits and conflicts. Strictly one-way — your Base44 app is never written to." },
  { title: "Honest reporting", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/ba25793ef_generated_image.png", body: "A missing auth config is reported as absent, not as \"login disabled\". An empty app list caused by a failed request says the request failed. The distinction matters when you are deciding whether to ship." },
];

export const CRAFT = [
  { title: "A real menu bar", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/4c8a9bbb0_generated_image.png", body: "File, Workspace, Project, Tools, Prompts, View and Help — around a hundred commands with keyboard accelerators. Developer-only menus disappear entirely in default mode rather than sitting greyed out, advertising features you have not opted into." },
  { title: "Command palette", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/609d2997f_generated_image.png", body: "Ctrl+K for everything, filtered to what is reachable in your current mode." },
  { title: "Accessibility", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/79a84fbd5_generated_image.png", body: "Keyboard-navigable tables, visible focus states, live regions announcing results, focus moved to the heading on navigation, and confirmation on every destructive action." },
  { title: "Nothing left running", image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/b23fdeb55_generated_image.png", body: "Preview servers are tracked and terminated with their child processes. Earlier tooling left orphaned backends behind that quietly consumed plan quota; this app never creates them, and tracks any it finds so you can clean them up." },
];

export const SECURITY = [
  "The window renders under a strict content security policy with context isolation on and Node integration off. Your Base44 credential is held by the CLI and read only in the privileged process — it never crosses into the page.",
  "The embedded editor is a separate process with its own session and no bridge to this app's internals. It is not an iframe, precisely because framing a third-party origin would have meant weakening the policy that keeps your token away from remote content.",
  "App artwork shows the same discipline. Those image URLs come from your account but can point anywhere, and in practice some do — third-party hosts, not Base44's CDN. Rather than allowing remote images and handing every one of those hosts your IP address, the app fetches them in the privileged process behind an allowlist that rejects local and private addresses, caps size, refuses formats that can carry script, and passes the bytes through as inline data.",
];

export const SPECS = [
  { item: "Application", detail: "Electron 33 · React 18 · TypeScript · Vite" },
  { item: "Base44 integration", detail: "Official CLI 0.1.5 for authentication and project operations, plus the same API the CLI's own project picker uses for app discovery" },
  { item: "Embedded editor", detail: "Isolated web view with a persistent session, no preload bridge" },
  { item: "Installer", detail: "NSIS · per-user, no administrator prompt · choose your install directory · desktop and Start Menu shortcuts" },
  { item: "Uninstall", detail: "Leaves migrated projects and history on disk" },
  { item: "Deploy targets", detail: "Vercel · Netlify · Cloudflare Pages · static" },
  { item: "Data stored locally", detail: "Settings, migration history, saved prompts, audit runs, recent projects. No telemetry." },
];

export const LIMITS = [
  "Apps whose source Base44 does not manage cannot be downloaded — you will be told before anything is attempted, not after.",
  "The installer is unsigned, so Windows will warn on first run until it builds reputation.",
  "Windows only at present. The codebase is cross-platform; the packaging is not yet.",
  "Audits are AI-generated findings. They are a strong first pass and a genuine time-saver, not a substitute for a security review before you handle real money or real personal data.",
];

export const PRICING = [
  {
    name: "Base44 Desktop IDE",
    badge: "Lifetime access",
    price: "$25",
    priceNote: "One-time payment. Lifetime access, including future updates. Requires a Base44 account.",
    tagline: "The full Windows workbench for every app in your Base44 account.",
    cta: "Get Lifetime Access — $25",
    highlight: true,
    features: [
      "Every app in your account, with artwork, in one window",
      "The genuine Base44 editor, embedded",
      "Local source viewer, preview server and backend logs",
      "Ten AI audits, run by the model inside your editor",
      "Saved prompt library, fired into any app's chat",
      "Optional frontend migration with full diffs and rollback",
      "Origin probes and twelve post-migration validation checks",
      "All future updates included",
    ],
  },
];

export const FAQS = [
  { q: "What is Base44 Desktop IDE?", a: "A Windows desktop application that signs in to your real Base44 account, lists every app you own, and opens any of them into a workspace with five tabs: the embedded Base44 editor, a local copy of the source, a preview server, backend logs, and an optional migration flow." },
  { q: "Is it affiliated with Base44?", a: "No. It is an independent tool built for people who build on Base44. It uses the official Base44 CLI and public APIs to talk to your account." },
  { q: "Can it break or change my Base44 app?", a: "No. Every operation is either read-only or writes to a folder you choose on your own disk. Your app stays in Base44, fully editable in Base44." },
  { q: "How does sign-in work?", a: "Base44's own device-code flow. The app shows a short code, you confirm it in your browser, and the credential is held by the Base44 CLI on your machine. It is read only in the privileged process and never crosses into the page." },
  { q: "Does migration move my backend?", a: "No. Migration relocates the frontend and wires it to your existing Base44 backend — same database, same users, same functions. Entities, functions, users and data stay on Base44." },
  { q: "Do I lose the ability to keep building in Base44?", a: "No. The export is a real git repository with stable commit hashes, so you keep building in Base44 and pull the changes down as a merge whenever you want them. Your own edits survive." },
  { q: "What do the audits actually do?", a: "You pick an audit and the app composes a detailed instruction and sends it to your Base44 editor's chat, so the review runs inside Base44 where the model can read your entities, functions, permission rules and pages. Every prompt asks for findings with severity, location, cause and fix — and explicitly forbids the model from changing anything." },
  { q: "Which operating systems are supported?", a: "Windows 10 and 11 (x64) at present. The codebase is cross-platform; the packaging is not yet." },
  { q: "Why does Windows warn me when I install it?", a: "The installer is unsigned, so Windows shows a warning on first run until the installer builds reputation. Installation is per-user and does not require an administrator prompt." },
  { q: "How much does it cost?", a: "$25 once, for lifetime access including future updates. You also need a Base44 account, since the app works against your real account." },
];