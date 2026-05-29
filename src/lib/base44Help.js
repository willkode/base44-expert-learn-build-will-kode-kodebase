// Beginner-friendly explanations of Base44 concepts. Keep them simple and practical.
export const HELP = {
  entity: {
    title: "What is a Base44 entity?",
    text: "An entity is a table of data — like Projects, Users, or Tasks. Each entity has fields (columns) and stores records (rows). Define your entities before building so the rest of the app has a solid foundation.",
  },
  ownerId: {
    title: "Why ownerId matters",
    text: "ownerId ties each record to the user who created it. It lets the app show people only their own data and keeps one user from seeing or editing another's records.",
  },
  crud: {
    title: "What CRUD means",
    text: "CRUD = Create, Read, Update, Delete — the four basic actions on data. Deciding who can do each action per entity is how you control access.",
  },
  adminData: {
    title: "Why admin-only data needs protection",
    text: "Some data (settings, all users, logs) should only be touched by admins. Without protection, a regular user could read or change it. Lock these areas to the admin role on both the page and the data.",
  },
  backendFunctions: {
    title: "Why backend functions handle sensitive logic",
    text: "Anything secret — API keys, payments, admin actions — must run on the backend, never in the browser. Backend functions keep secrets hidden and verify who is calling before acting.",
  },
  phases: {
    title: "Why you should build in phases",
    text: "Building everything at once leads to broken, tangled apps. Build in order — foundation, data, pages, workflows, then polish — so each step works before the next is added.",
  },
  securityPrompts: {
    title: "Why security prompts matter",
    text: "A security pass catches missing ownership checks, exposed data, and weak permissions before launch. Fixing these early is far cheaper than after real users are on the app.",
  },
  qaPrompts: {
    title: "Why QA prompts reduce wasted credits",
    text: "A QA pass finds bugs in a structured way instead of trial-and-error. Catching issues in one focused review saves you repeated regeneration and wasted build credits.",
  },
  cleanData: {
    title: "Why clean data structure comes first",
    text: "Your entities are the backbone of the app. A clear, well-named data structure up front prevents costly rework later, since pages, permissions, and functions all depend on it.",
  },
};