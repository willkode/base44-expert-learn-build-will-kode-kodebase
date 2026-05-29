import React from "react";
import {
  Database, Users, ShieldCheck, Server, LayoutDashboard,
  ListOrdered, Lock, ClipboardCheck, Rocket,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

const SECTIONS = [
  {
    icon: Database,
    title: "Entities",
    points: [
      "An entity is a table of data (e.g. Projects, Tasks, Users). Fields are columns, records are rows.",
      "Plan your entities first — pages, permissions, and functions all depend on a clean data structure.",
      "Name fields clearly and avoid duplicating data across entities.",
    ],
  },
  {
    icon: Users,
    title: "Roles",
    points: [
      "Roles define what a user can do. The two built-in roles are 'user' and 'admin'.",
      "Use roles to separate normal users from people who manage the whole app.",
      "Keep roles simple — only add new ones when a real need exists.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Permissions",
    points: [
      "Permissions control who can Create, Read, Update, and Delete (CRUD) each entity.",
      "ownerId ties a record to its creator so users only see their own data.",
      "Admin-only data (settings, logs, all users) must be locked to the admin role.",
    ],
  },
  {
    icon: Server,
    title: "Backend Functions",
    points: [
      "Sensitive logic — API keys, payments, admin actions — must run on the backend, not the browser.",
      "Backend functions keep secrets hidden and verify who is calling before acting.",
      "Always check the user is authenticated, and check the admin role for admin-only actions.",
    ],
  },
  {
    icon: LayoutDashboard,
    title: "Admin Dashboards",
    points: [
      "Admin dashboards give a system-wide view: users, projects, usage, and settings.",
      "Protect them with role checks on both the page route and the underlying data.",
      "Never expose admin data or actions to regular users.",
    ],
  },
  {
    icon: ListOrdered,
    title: "Prompt Sequencing",
    points: [
      "Build in phases: foundation, entities, auth, pages, workflows, then polish.",
      "Each prompt should build on the last so nothing breaks half-finished.",
      "Sequencing prevents tangled apps and reduces wasted regenerations.",
    ],
  },
  {
    icon: Lock,
    title: "Security Pass",
    points: [
      "A security pass catches missing ownership checks, exposed data, and weak permissions.",
      "Run it before launch — fixing issues early is far cheaper than after real users arrive.",
      "Treat high and critical findings as blockers.",
    ],
  },
  {
    icon: ClipboardCheck,
    title: "QA Pass",
    points: [
      "A QA pass tests flows in a structured way instead of trial-and-error.",
      "Catching bugs in one focused review saves repeated regeneration and build credits.",
      "Track each test as pending, passed, or failed before launch.",
    ],
  },
  {
    icon: Rocket,
    title: "Launch Checklist",
    points: [
      "Confirm entities, permissions, and ownership checks are all in place.",
      "Pass the security and QA reviews with no open blockers.",
      "Verify loading, empty, and error states exist on key pages, then ship.",
    ],
  },
];

export default function Help() {
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Base44 Architecture Basics"
        description="A quick, practical guide to the core concepts behind a well-built Base44 app."
      />
      <div className="grid gap-5">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card/60 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-sora font-semibold text-lg">{s.title}</h2>
            </div>
            <ul className="space-y-2.5">
              {s.points.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}