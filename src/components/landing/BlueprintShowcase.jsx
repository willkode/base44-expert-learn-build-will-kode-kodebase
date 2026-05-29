import React from "react";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Database, ShieldCheck, LayoutGrid, Terminal, GitBranch, ListChecks } from "lucide-react";

const slides = [
  {
    icon: Database,
    tag: "Data Model",
    title: "Entity Plan",
    file: "entities/Audit.json",
    lines: [
      "{",
      '  "name": "Audit",',
      '  "type": "object",',
      '  "properties": {',
      '    "websiteId": { "type": "string" },',
      '    "ownerId": { "type": "string" },',
      '    "status": {',
      '      "enum": ["new","running","completed","failed"]',
      "    },",
      '    "seoScore": { "type": "number" },',
      '    "issuesFound": { "type": "number" }',
      "  },",
      '  "required": ["websiteId"]',
      "}",
    ],
  },
  {
    icon: ShieldCheck,
    tag: "Security",
    title: "Row-Level Security",
    file: "security/rls-plan.md",
    lines: [
      "## Audit — Access Rules",
      "",
      "read:",
      "  $or:",
      "    - created_by_id: {{user.id}}",
      "    - user_condition: { role: admin }",
      "",
      "write:",
      "  created_by_id: {{user.id}}",
      "",
      "⚠ Enforce ownership on every backend",
      "  function — never trust client input.",
    ],
  },
  {
    icon: LayoutGrid,
    tag: "Page Map",
    title: "App Structure",
    file: "pages/page-map.md",
    lines: [
      "# Authenticated Dashboard",
      "- /dashboard      → overview cards",
      "- /websites       → list + add/edit",
      "- /audits/:id     → report viewer",
      "- /tasks          → kanban board",
      "- /reports        → export PDF / CSV",
      "",
      "# Admin",
      "- /admin/users    → role management",
      "- /admin/logs     → activity monitor",
    ],
  },
  {
    icon: Terminal,
    tag: "Prompt Pack",
    title: "Build Prompt #4",
    file: "prompts/04-audit-engine.txt",
    lines: [
      "Create a backend function `runAudit` that:",
      "1. Accepts { websiteId } and verifies the",
      "   caller owns that website.",
      "2. Crawls the URL, scores Core Web Vitals,",
      "   and detects on-page SEO issues.",
      "3. Stores results on the Audit entity and",
      "   generates prioritized Task records.",
      "Return 403 if the user is not the owner.",
    ],
  },
  {
    icon: GitBranch,
    tag: "Workflow",
    title: "Audit Flow",
    file: "workflows/audit-flow.md",
    lines: [
      "1. User submits website URL",
      "2. System creates Audit (status: new)",
      "3. runAudit() crawls + scores the site",
      "4. AI engine generates fix recommendations",
      "5. Tasks auto-created from findings",
      "6. User notified — report ready",
    ],
  },
  {
    icon: ListChecks,
    tag: "QA Checklist",
    title: "Launch Tests",
    file: "qa/checklist.md",
    lines: [
      "[ ] Non-owner cannot read another's audit",
      "[ ] Free plan blocked after 3 audits",
      "[ ] Failed crawl sets status: failed",
      "[ ] PDF export matches on-screen report",
      "[ ] Admin can view all user activity",
      "[ ] Stripe webhook updates subscription",
    ],
  },
];

export default function BlueprintShowcase() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-[0.35]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[160px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Inside a real blueprint</span>
          </div>
          <h2 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight mb-5">
            See the <span className="text-gradient-orange">structure & detail</span> before you build
          </h2>
          <p className="text-lg text-muted-foreground">
            Every blueprint ships with a complete data model, security rules, page map, sequenced
            build prompts, workflows, and a QA checklist. Here's a peek at what gets generated.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {slides.map((s, i) => (
                <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="group h-full rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-xl ring-1 ring-white/5 hover:border-primary/40 transition-all duration-300 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-secondary/30">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-chart-2/60" />
                      <span className="ml-2 text-xs text-muted-foreground font-mono truncate">{s.file}</span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <s.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-primary font-semibold">{s.tag}</p>
                          <h3 className="font-sora font-semibold text-sm">{s.title}</h3>
                        </div>
                      </div>
                      <pre className="text-xs leading-relaxed font-mono text-muted-foreground whitespace-pre-wrap overflow-hidden">
                        {s.lines.join("\n")}
                      </pre>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-4 bg-card border-border hover:bg-secondary text-foreground" />
            <CarouselNext className="hidden sm:flex -right-4 bg-card border-border hover:bg-secondary text-foreground" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}