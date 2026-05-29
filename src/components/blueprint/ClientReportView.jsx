import React, { useState } from "react";
import { Copy, Download, Printer, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Markdown from "@/components/blueprint/Markdown";
import { clientReportMarkdown, copyText, downloadMarkdown, printContent } from "@/lib/exporters";

const CORE_SECTIONS = [
  ["Project Overview", "executiveSummary"],
  ["Recommended Build Scope", "appArchitecture"],
  ["MVP Features", "mvpRoadmap"],
];

const DETAIL_SECTIONS = [
  ["User Roles", "rolePermissionPlan"],
  ["Page List", "pagePlan"],
  ["Workflow Summary", "workflowPlan"],
  ["Integration Summary", "integrationPlan"],
];

function ReportSection({ title, content }) {
  if (!content) return null;
  return (
    <div className="space-y-2">
      <h3 className="font-sora font-semibold text-lg">{title}</h3>
      <div className="text-sm leading-relaxed text-muted-foreground"><Markdown content={content} /></div>
    </div>
  );
}

export default function ClientReportView({ project, blueprint, isAgency }) {
  const [expanded, setExpanded] = useState(false);
  const [meta, setMeta] = useState({ clientName: "", agencyName: "", preparedBy: "", projectNotes: "" });
  const set = (k, v) => setMeta((m) => ({ ...m, [k]: v }));

  const md = () => clientReportMarkdown(project, blueprint, isAgency ? meta : {});

  const handlePrint = () => {
    const html = md().split("\n").map((l) =>
      l.startsWith("# ") ? `<h1>${l.slice(2)}</h1>`
      : l.startsWith("## ") ? `<h2>${l.slice(3)}</h2>`
      : l.startsWith("> ") ? `<p class="muted">${l.slice(2)}</p>`
      : l.startsWith("**") ? `<p class="muted">${l.replace(/\*\*/g, "")}</p>`
      : l.trim() ? `<p>${l}</p>` : ""
    ).join("");
    printContent(`${project.projectName} — Client Report`, html);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => copyText(md(), "Client report copied")}>
          <Copy className="w-4 h-4 mr-2" /> Copy client report
        </Button>
        <Button variant="outline" onClick={() => downloadMarkdown(`${project.projectName}-client-report.md`, md())}>
          <Download className="w-4 h-4 mr-2" /> Export as markdown
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" /> Print client report
        </Button>
      </div>

      {isAgency && (
        <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
          <h3 className="font-sora font-semibold">Report details</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label className="mb-1.5 block text-sm">Client name</Label>
              <Input value={meta.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="Acme Inc." />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Agency name</Label>
              <Input value={meta.agencyName} onChange={(e) => set("agencyName", e.target.value)} placeholder="Your Agency" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Prepared by</Label>
              <Input value={meta.preparedBy} onChange={(e) => set("preparedBy", e.target.value)} placeholder="Jane Doe" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Project notes</Label>
            <Textarea value={meta.projectNotes} onChange={(e) => set("projectNotes", e.target.value)} className="h-20" placeholder="Notes shown in the report..." />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 space-y-7">
        <div className="border-b border-border pb-5">
          <h2 className="font-sora font-bold text-2xl">{project.projectName} — Project Report</h2>
          {isAgency && (meta.clientName || meta.agencyName) && (
            <p className="text-sm text-muted-foreground mt-1">
              {meta.clientName && `Prepared for ${meta.clientName}`}
              {meta.clientName && meta.agencyName && " · "}
              {meta.agencyName && `by ${meta.agencyName}`}
              {meta.preparedBy && ` (${meta.preparedBy})`}
            </p>
          )}
          {project.shortDescription && <p className="text-sm text-muted-foreground mt-2 italic">{project.shortDescription}</p>}
        </div>

        {CORE_SECTIONS.map(([title, key]) => <ReportSection key={key} title={title} content={blueprint[key]} />)}

        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Hide" : "Show"} detailed scope (roles, pages, workflows, integrations)
          </button>
          {expanded && (
            <div className="mt-5 space-y-7">
              {DETAIL_SECTIONS.map(([title, key]) => <ReportSection key={key} title={title} content={blueprint[key]} />)}
            </div>
          )}
        </div>

        {isAgency && meta.projectNotes && <ReportSection title="Project Notes" content={meta.projectNotes} />}

        <ReportSection title="Estimated Build Phases" content={blueprint.mvpRoadmap ? "See MVP Features above for the phased build order." : "Phased delivery will be confirmed during kickoff."} />
        <ReportSection title="Risk Notes" content="Key risks and mitigations will be reviewed before development begins." />
        <ReportSection title="Next Steps" content={"1. Review and approve this report.\n2. Confirm scope and timeline.\n3. Begin MVP development."} />
      </div>
    </div>
  );
}