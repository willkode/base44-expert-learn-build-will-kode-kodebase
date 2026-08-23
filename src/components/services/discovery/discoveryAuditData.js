export const DISCOVERY_PRICE = 225;

export const OG_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/8a4c480fa_generated_image.png";

export const heroPoints = [
  "Whole-app review, not a single-area check",
  "Major security & functionality issues fixed at no extra cost",
  "Targeted fix prompts for everything else",
];

export const auditAreas = [
  {
    num: "01",
    title: "Security",
    desc: "Entity permissions, ownership checks, admin-only data, exposed secrets, backend functions that trust the client, and anything a real user could abuse.",
  },
  {
    num: "02",
    title: "Code Quality",
    desc: "Duplicated and drifted logic, oversized files, dead code, fragile state, missing error handling, and patterns that will slow every future change.",
  },
  {
    num: "03",
    title: "Functionality",
    desc: "Every flow walked end to end — broken buttons, dead routes, forms that don't save, empty and loading states, and features that half-work.",
  },
  {
    num: "04",
    title: "UI / UX",
    desc: "Layout, hierarchy, contrast, spacing, mobile behaviour, tap targets, and the friction points quietly costing you conversions.",
  },
  {
    num: "05",
    title: "Data Model",
    desc: "Entity structure, relationships, duplicated fields, and the schema decisions that will cause pain as your data grows.",
  },
  {
    num: "06",
    title: "Performance",
    desc: "Over-fetching, missing pagination, blocking calls on first paint, heavy assets, and slow pages users actually notice.",
  },
];

export const included = [
  "Complete review of the entire app",
  "Full written report of every issue found",
  "Issues ranked by severity and impact",
  "All major security issues fixed — no extra cost",
  "All major functionality issues fixed — no extra cost",
  "Targeted, copy-paste fix prompts for everything else",
  "Prioritized recommendations roadmap",
  "Data model and architecture notes",
  "UI/UX improvement recommendations",
  "Mobile and responsiveness findings",
];

export const steps = [
  { num: "01", title: "You book the audit", desc: "One payment of $225. No retainer, no scoping call required." },
  { num: "02", title: "Send access", desc: "Your app URL and, if needed, login details so I can review gated pages." },
  { num: "03", title: "I review everything", desc: "Security, code quality, functionality, UI/UX, data model and performance." },
  { num: "04", title: "You get the report", desc: "Every issue documented and ranked, with clear recommendations." },
  { num: "05", title: "I fix the big stuff", desc: "Major security and functionality issues are corrected at no extra cost." },
  { num: "06", title: "You get the prompts", desc: "A targeted prompt list so you can knock out the remaining items yourself." },
];

export const faqs = [
  { q: "What exactly is a Discovery Audit?", a: "It's a complete inspection of your app. Like having a mechanic look over a car before you buy it — I tell you everything that's wrong, what must be fixed, and what would make it better. Then I fix the major security and functionality problems for you." },
  { q: "What does the $225 include?", a: "The full review, the written report with every issue ranked, hands-on fixes for all major security and functionality issues, and a targeted list of prompts for the remaining lower-priority items." },
  { q: "What counts as a 'major' issue you fix for free?", a: "Anything that exposes data, lets a user act outside their permissions, breaks a core flow, or stops the app from functioning. Cosmetic polish, nice-to-have features and large refactors are covered by the prompt list instead." },
  { q: "Is this only for Base44 apps?", a: "Base44 apps are the specialty, but the same review applies to any React web app — the security, data, code quality and UX checks are platform-agnostic." },
  { q: "How long does it take?", a: "The report is typically delivered within 3–5 business days, with the major fixes applied shortly after." },
  { q: "Do you need access to my app?", a: "Yes — a URL plus login credentials for any gated pages. To apply fixes I'll also need builder access to the app." },
  { q: "What if the app needs more work than an audit?", a: "The report will say so plainly, and you can move into KodeCare, a Security Audit, or a custom build. The audit is never a sales trap — you own the findings either way." },
];