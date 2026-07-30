export const CLASS_INFO = {
  title: "Base44 Master Class",
  subtitle: "Vibe Coding Mastery Academy",
  startIso: "2026-08-10T10:00:00-05:00",
  startLabel: "Monday, August 10, 2026 · 10:00 AM CST",
  priceCents: 9900,
  priceLabel: "$99",
  seats: 100,
  serviceId: "masterclass_seat",
};

export const WEEKLY_FORMAT = [
  { day: "Monday", type: "Learn", purpose: "Introduce the concepts and terminology" },
  { day: "Tuesday", type: "Inspect", purpose: "Review examples, applications, prompts, or code" },
  { day: "Wednesday", type: "Build", purpose: "Complete a guided implementation" },
  { day: "Thursday", type: "Test", purpose: "Debug, validate, secure, or improve the work" },
  { day: "Friday", type: "Submit", purpose: "Complete an assessment, challenge, or project milestone" },
];

export const PHASES = [
  {
    name: "Phase One — Prompt Engineering & Application Planning",
    weeks: [
      {
        week: 1,
        title: "Understanding Vibe Coding",
        days: [
          "What vibe coding is and how it differs from traditional development",
          "Compare weak AI-generated applications with properly engineered applications",
          "Select the correct AI tool for several development scenarios",
          "Identify the risks of blindly accepting AI output",
          "Create a personal AI development workflow",
        ],
        outcome: "Students understand their role as the application architect and decision-maker.",
      },
      {
        week: 2,
        title: "Prompt Engineering Fundamentals",
        days: [
          "Context, objectives, requirements, and constraints",
          "Review effective and ineffective development prompts",
          "Rewrite vague prompts using a structured framework",
          "Test prompts and identify AI assumptions",
          "Build a reusable feature-prompt template",
        ],
        outcome: "Students can write structured prompts that produce predictable results.",
      },
      {
        week: 3,
        title: "Advanced Prompting and Debugging",
        days: [
          "Breaking large features into controlled prompts",
          "Prompting AI to inspect before making changes",
          "Writing debugging prompts using symptoms, logs, and reproduction steps",
          "Preventing unnecessary rewrites and destructive changes",
          "Repair a deliberately broken feature using a prompt sequence",
        ],
        outcome: "Students can manage complex AI tasks without losing control of the project.",
      },
      {
        week: 4,
        title: "Application Planning",
        days: [
          "Defining the problem, audience, and desired outcome",
          "Mapping user roles and user journeys",
          "Creating a page map, feature list, and data model",
          "Defining permissions, workflows, and acceptance criteria",
          "Complete a product requirements document",
        ],
        outcome: "Students produce a complete plan for an application before building it.",
      },
    ],
  },
  {
    name: "Phase Two — Base44 Application Development",
    weeks: [
      {
        week: 5,
        title: "Base44 Foundations",
        days: [
          "Base44 workspace, pages, entities, integrations, and functions",
          "Inspect an existing Base44 application",
          "Generate an application from a structured build prompt",
          "Correct layout, logic, and navigation problems",
          "Complete a basic project-management application",
        ],
        outcome: "Students can create and control a structured Base44 application.",
      },
      {
        week: 6,
        title: "Base44 UI and User Experience",
        days: [
          "Application shells, navigation, dashboards, and layouts",
          "Review strong and weak AI-generated interfaces",
          "Build forms, tables, cards, modals, and detail pages",
          "Add loading, empty, error, and confirmation states",
          "Complete a responsive UI improvement challenge",
        ],
        outcome: "Students can create professional, consistent application interfaces.",
      },
      {
        week: 7,
        title: "Data Modeling and Application Logic",
        days: [
          "Entities, fields, records, and relationships",
          "Inspect common data-modeling mistakes",
          "Build one-to-many and many-to-many relationships",
          "Add statuses, calculated values, history, and archiving",
          "Build the data structure for a CRM",
        ],
        outcome: "Students can design reliable application data structures.",
      },
      {
        week: 8,
        title: "Authentication and Security",
        days: [
          "Authentication versus authorization",
          "Roles, permissions, ownership, and administrative access",
          "Create member, manager, and administrator roles",
          "Test unauthorized access and privileged actions",
          "Complete a security and permissions audit",
        ],
        outcome: "Students can protect application data and functionality.",
      },
      {
        week: 9,
        title: "APIs and Integrations",
        days: [
          "APIs, requests, responses, JSON, and authentication",
          "Review common API documentation",
          "Connect an external service to Base44",
          "Handle errors, retries, and invalid responses",
          "Complete an integration-based application feature",
        ],
        outcome: "Students can connect Base44 applications to external platforms.",
      },
      {
        week: 10,
        title: "Workflows and Automations",
        days: [
          "Event-driven and scheduled workflows",
          "Map an automation from trigger to completion",
          "Build notifications, status updates, and automated actions",
          "Add failure handling and workflow logs",
          "Build an automated client-onboarding system",
        ],
        outcome: "Students can create reliable multi-step application workflows.",
      },
      {
        week: 11,
        title: "Mobile Applications with Base44",
        days: [
          "Responsive web apps, PWAs, wrappers, and native applications",
          "Review mobile navigation and usability patterns",
          "Convert an existing interface into a mobile-first experience",
          "Test forms, keyboards, touch targets, and device sizes",
          "Prepare a Base44 application for mobile distribution",
        ],
        outcome:
          "Students can create app-store-ready mobile experiences while understanding platform limitations.",
      },
      {
        week: 12,
        title: "Base44 Production Readiness",
        days: [
          "Functionality and route testing",
          "Security and permissions testing",
          "Performance, accessibility, and mobile testing",
          "Analytics, domains, privacy policies, and deployment",
          "Submit the Base44 production capstone",
        ],
        outcome: "Capstone: build and launch a secure, responsive, multi-user Base44 application.",
      },
    ],
  },
  {
    name: "Phase Three — Claude & Standalone Development",
    weeks: [
      {
        week: 13,
        title: "Developer Environment and Git",
        days: [
          "Files, folders, codebases, and terminals",
          "Node.js, package managers, and local development servers",
          "Git commits, branches, repositories, and GitHub",
          "Environment variables and project configuration",
          "Clone, run, modify, and publish an application",
        ],
        outcome: "Students can work safely inside a real codebase.",
      },
      {
        week: 14,
        title: "Managing Claude as a Development Agent",
        days: [
          "Claude, Claude Code, project instructions, and context",
          "Planning mode, implementation mode, and file inspection",
          "Assign a controlled feature implementation",
          "Review diffs, test changes, and revert failed work",
          "Complete an AI-agent management challenge",
        ],
        outcome: "Students can direct Claude like a junior development team member.",
      },
      {
        week: 15,
        title: "Web Applications with Claude",
        days: [
          "React, TypeScript, components, and routing",
          "Application state, forms, and reusable UI",
          "Build authentication and protected routes",
          "Connect APIs and database operations",
          "Deploy a standalone React application",
        ],
        outcome: "Students can create and deploy a modern web application.",
      },
      {
        week: 16,
        title: "Base44 Backend as a Service",
        days: [
          "Backend-as-a-service architecture",
          "Base44 CLI, SDK, entities, and generated types",
          "Connect a custom React frontend to Base44",
          "Add authentication, backend functions, and secrets",
          "Deploy a custom frontend with a Base44 backend",
        ],
        outcome:
          "Students can use Base44 as infrastructure without relying on its generated frontend.",
      },
      {
        week: 17,
        title: "Native Mobile Applications with Claude",
        days: [
          "React Native, Expo, and native application architecture",
          "Screens, navigation, and native components",
          "Add authentication, APIs, and remote data",
          "Add device permissions, camera access, and secure storage",
          "Create Android and iOS test builds",
        ],
        outcome: "Students can build true native mobile applications.",
      },
      {
        week: 18,
        title: "Desktop Applications with Claude",
        days: [
          "Electron architecture and desktop application structure",
          "Windows, menus, local storage, and filesystem access",
          "Build secure communication between application processes",
          "Add authentication, APIs, updates, and error reporting",
          "Package a desktop application for distribution",
        ],
        outcome: "Students can create installable desktop software.",
      },
    ],
  },
  {
    name: "Phase Four — Production Engineering",
    weeks: [
      {
        week: 19,
        title: "Architecture, Testing, and Security",
        days: [
          "Maintainable application architecture",
          "Unit, integration, and end-to-end testing",
          "Security reviews, validation, and secret management",
          "Performance, accessibility, and dependency reviews",
          "Audit and repair a deliberately vulnerable application",
        ],
        outcome: "Students can identify and correct production risks.",
      },
      {
        week: 20,
        title: "Professional Development and Final Capstone",
        days: [
          "Project scoping and technical discovery",
          "Architecture and implementation planning",
          "Build and document the capstone application",
          "Complete testing, security, and production-readiness reviews",
          "Present and defend the completed application",
        ],
        outcome:
          "Final capstone: PRD, permissions matrix, page map, data model, architecture plan, working app, test plan, security review, deployment and user docs, plus a demo presentation.",
      },
    ],
  },
];

export const ADD_ONS = [
  {
    name: "Marketing Your Products and Services",
    duration: "6 weeks · 5 sessions per week · 4–7 hrs/week",
    promise:
      "Turn an application or service into an offer people understand, trust, and purchase — for software products and for development, audit, migration, and consulting services.",
    weeks: [
      "Market research and positioning — target-customer profile and positioning document",
      "Creating an offer — packages, pricing, tiers, guarantees, objection handling",
      "Brand messaging and sales copy — one-line pitch through to service-page copy",
      "Landing pages and conversion — structure, proof, pricing, tracking, usability",
      "Content, social media, and email — 30-day calendar, lead magnet, sequences",
      "Launching and growing — campaigns, partnerships, paid ads, analytics, go-to-market plan",
    ],
  },
  {
    name: "Vibe Coding Agency",
    duration: "8 weeks · 5 sessions per week · 5–8 hrs/week",
    promise:
      "Establish and operate an agency selling AI-assisted application development, audits, migrations, consulting, and support — with AI increasing capacity, never removing responsibility for quality and results.",
    weeks: [
      "Agency foundation — structure, registration, banking, insurance, tools, launch checklist",
      "Niche, services, and pricing — productized audits, migrations, builds, retainers",
      "Authority and portfolio building — demo apps, case studies, agency site",
      "Finding qualified leads — communities, outreach, partnerships, weekly lead system",
      "Sales and discovery calls — qualification, scripts, objections, recorded mock call",
      "Proposals, contracts, and closing — scopes, estimates, terms, agreements",
      "Project delivery and client management — onboarding, milestones, QA, handoff",
      "Retainers, systems, and scaling — SOPs, contractors, capacity, 90-day growth plan",
    ],
  },
];

export const CERTIFICATIONS = [
  { name: "KodeBase Certified Prompt Engineer", req: "Weeks 1–4" },
  { name: "KodeBase Certified Base44 Builder", req: "Weeks 5–12 + Base44 capstone" },
  { name: "KodeBase Certified AI Application Developer", req: "Weeks 13–20 + final technical capstone" },
  { name: "KodeBase Certified Product Marketing Specialist", req: "Marketing course + launch plan" },
  { name: "KodeBase Certified Vibe Coding Agency Operator", req: "Agency course + agency capstone" },
  { name: "KodeBase Certified Vibe Coding Entrepreneur", req: "Technical + marketing + agency programs" },
];

export const PROGRAM_STATS = [
  { value: "20", label: "Weeks in the core program" },
  { value: "5", label: "Sessions per week" },
  { value: "170", label: "Daily sessions across the full academy" },
  { value: "20+", label: "Exercises, 8 portfolio builds, 3 capstones" },
];