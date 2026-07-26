export const DOWNLOAD_URL =
  "https://drive.google.com/drive/folders/1qMHmgSzPs2cteHVob6Q9Tp2V-1gyN4Fc?usp=sharing";

export const PROBLEM = [
  {
    title: "eject forks instead of exporting",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/3b5ef9329_generated_image.png",
    body: "The CLI wraps the download endpoint with a hidden \"create a new project\" step. You end up with your code bound to a brand-new, empty backend — your work split across two projects.",
  },
  {
    title: "Two URL options, one default",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/9158dcb5c_generated_image.png",
    body: "Exports hardcode serverUrl: '' and leave appBaseUrl unset. Fix only serverUrl and data loads while sign-in 404s — an app that looks healthy until someone clicks Sign in.",
  },
  {
    title: "The docs say it's impossible",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/d87e82236_generated_image.png",
    body: "The GitHub-integration page claims apps can't be hosted outside Base44 while using it as a backend. Measurement says otherwise — CORS, OAuth and the SDK all handle foreign origins.",
  },
];

export const HOW_IT_WORKS = [
  {
    title: "Download, create nothing",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/83d7fdc6d_generated_image.png",
    body: "Base44 serves an app's source at GET /api/apps/{id}/eject. Called directly it's a plain read — verified by counting apps before and after: 224 → 224. The archive is completely unbound, so there's nothing to un-wire.",
  },
  {
    title: "Analyze before writing",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/80ce567f2_generated_image.png",
    body: "The pipeline is download → analyze → connect → rewrite → emit, pausing before it writes anything. Every planned edit is shown as a diff with a stated reason, and apply is blocked while a blocker is open.",
  },
  {
    title: "Build, serve and probe",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/dea26546f_generated_image.png",
    body: "It can install, build and serve the ported app locally, then run real cross-origin probes against the live backend to prove data calls and auth both work from the new origin.",
  },
  {
    title: "Host config on the way out",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c22e05f0a_generated_image.png",
    body: "Generates deployment config for Vercel, Netlify, Cloudflare Pages or a plain static server, so the ported frontend goes straight into your existing pipeline.",
  },
  {
    title: "Updates via real git",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/1f08c1833_generated_image.png",
    body: "The export is a git repository with identical commit hashes between downloads (same HEAD SHA, same 7 commits, twice). Pulling new Base44 changes is a genuine fetch + merge — your local edits survive and conflicts only appear where both sides touched the same lines.",
  },
  {
    title: "A security pass on your app",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/7fbe7ab2a_generated_image.png",
    body: "The analyzer flags service-role calls in browser code, payments integrations, connector callbacks, and editor tooling left enabled in vite.config.js. On a real app it found a service-role entity update inside a React page.",
  },
];

export const FINDINGS = [
  {
    title: "Cross-origin access works",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/efa1a7c67_generated_image.png",
    body: "Measured from a real browser origin: simple GET, preflighted GET with an Authorization header, and preflighted JSON POST all succeed. Only cookie-bearing requests are rejected — expected with a wildcard allow-origin, and harmless since the SDK keeps its JWT in localStorage.",
  },
  {
    title: "Social login returns to a foreign origin",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/027a0e546_generated_image.png",
    body: "The login endpoint carries from_url through the OAuth state, so a ported app on an arbitrary localhost port is redirected back correctly after Google sign-in.",
  },
  {
    title: "serverUrl ≠ appBaseUrl",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/49244973b_generated_image.png",
    body: "serverUrl defaults to https://base44.app; appBaseUrl has no default and normalizes to \"\", making the login URL relative. That's the nastiest failure mode in the whole port.",
  },
  {
    title: "Export shape varies",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/52dc9f5f1_generated_image.png",
    body: "One app routes its ID through app-params; another hardcodes serverUrl: ''. Some set logLevel: 'error', which suppresses the dev server address banner — so the tool picks its own port and polls it instead of scraping logs.",
  },
  {
    title: "No app-list command",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/9365e2850_generated_image.png",
    body: "CLI v0.1.5 has no apps list, but link fills its picker from GET /api/apps. The tool uses the same endpoint, filtered by workspace_id — organization_id is silently ignored.",
  },
  {
    title: "Verified, not assumed",
    image: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/af84a7416_generated_image.png",
    body: "Three offline suites cover CLI launching, login-output parsing, and the full analyze → rewrite → emit → apply → rollback pipeline. A read-only live check validates discovery against a real account: 265 apps across 35 of 48 workspaces.",
  },
];

export const LIMITATIONS = [
  "Only apps whose source Base44 holds can be downloaded — CLI-created and GitHub-synced apps have nothing to fetch. The tool detects these up front and hands you the env line to point your existing code at that backend instead.",
  "GET /api/apps/{id}/eject and GET /api/apps are internal, undocumented endpoints. They could change. Discovery degrades through a provider chain down to manual app-ID entry, so you lose convenience rather than access.",
  "Local preview needs Node; updates need Git. Everything up to producing a ported project works without either.",
  "Base44's site hosting is the one capability that doesn't survive the move — which is the entire point.",
];

export const SAFETY = [
  "Nothing is written without your approval — every edit is a reviewable diff with a reason.",
  "Tokens never leave the main process. The renderer runs with context isolation, no Node integration and a strict CSP.",
  "No shell, anywhere. Every child process is spawned with an argument array, never a shell string.",
  "Keyboard-operable tables, live regions for async progress, focus management, and a palette measured against WCAG AA.",
];