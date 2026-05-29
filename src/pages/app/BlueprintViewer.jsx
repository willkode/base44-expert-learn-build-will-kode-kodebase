import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FileText, Download, Wand2, ShieldCheck, ArrowLeft, Copy, Printer, Presentation } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { blueprintMarkdown, copyText, downloadMarkdown, printContent } from "@/lib/exporters";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import BlueprintSection from "@/components/blueprint/BlueprintSection";
import SecurityFindings from "@/components/blueprint/SecurityFindings";
import QAChecklistView from "@/components/blueprint/QAChecklistView";
import ClientReportView from "@/components/blueprint/ClientReportView";
import InfoCard from "@/components/help/InfoCard";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "entities", label: "Entity Plan" },
  { key: "permissions", label: "Roles & Permissions" },
  { key: "pages", label: "Page Plan" },
  { key: "workflows", label: "Workflows" },
  { key: "backend", label: "Backend Functions" },
  { key: "integrations", label: "Integrations" },
  { key: "roadmap", label: "MVP Roadmap" },
  { key: "security", label: "Security Notes" },
  { key: "qa", label: "QA Checklist" },
];

export default function BlueprintViewer() {
  const { project } = useOutletContext();
  const navigate = useNavigate();
  const { user } = useAuth();
  const plan = user?.plan || "free";
  const canClientReport = plan === "pro" || plan === "agency";
  const isAgency = plan === "agency";
  const [loading, setLoading] = useState(true);
  const [clientMode, setClientMode] = useState(false);
  const [blueprint, setBlueprint] = useState(null);
  const [findings, setFindings] = useState([]);
  const [qaItems, setQaItems] = useState([]);

  const loadData = () => {
    Promise.all([
      base44.entities.Blueprint.filter({ projectId: project.id }, "-created_date", 1),
      base44.entities.SecurityFinding.filter({ projectId: project.id }),
      base44.entities.QAItem.filter({ projectId: project.id }),
    ]).then(([b, s, q]) => {
      setBlueprint(b[0] || null);
      setFindings(s);
      setQaItems(q);
      setLoading(false);
    });
  };

  useEffect(loadData, [project.id]);

  const reloadQA = () => {
    base44.entities.QAItem.filter({ projectId: project.id }).then(setQaItems);
  };

  const handleExport = () => downloadMarkdown(`${project.projectName}-blueprint.md`, blueprintMarkdown(project, blueprint));
  const handleCopyAll = () => copyText(blueprintMarkdown(project, blueprint), "Full blueprint copied");
  const handlePrint = () => {
    const md = blueprintMarkdown(project, blueprint);
    const html = md
      .split("\n")
      .map((l) =>
        l.startsWith("# ") ? `<h1>${l.slice(2)}</h1>`
        : l.startsWith("## ") ? `<h2>${l.slice(3)}</h2>`
        : l.startsWith("**") ? `<p class="muted">${l.replace(/\*\*/g, "")}</p>`
        : l.trim() ? `<p>${l}</p>` : ""
      ).join("");
    printContent(`${project.projectName} — Blueprint`, html);
  };

  if (loading) return <LoadingState label="Loading blueprint..." />;

  if (!blueprint) {
    return (
      <EmptyState
        icon={FileText}
        title="No blueprint generated yet"
        description={`Generate a full Base44 build blueprint for "${project.projectName}" from the Overview tab.`}
        actionLabel="Go to Overview"
        onAction={() => navigate(`/projects/${project.id}/overview`)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => navigate(`/projects/${project.id}/overview`)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to project
        </Button>
        {canClientReport && (
          <Button variant={clientMode ? "default" : "outline"} onClick={() => setClientMode((v) => !v)}>
            <Presentation className="w-4 h-4 mr-2" /> {clientMode ? "Exit client report" : "Client Report Mode"}
          </Button>
        )}
        <Button variant="outline" onClick={handleCopyAll}>
          <Copy className="w-4 h-4 mr-2" /> Copy full blueprint
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Export markdown
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
        <Button variant="outline" onClick={() => navigate(`/projects/${project.id}/prompts`)}>
          <Wand2 className="w-4 h-4 mr-2" /> Generate prompt pack
        </Button>
        <Button variant="outline" onClick={() => navigate(`/projects/${project.id}/security`)}>
          <ShieldCheck className="w-4 h-4 mr-2" /> Run security review
        </Button>
      </div>

      {clientMode && canClientReport ? (
        <ClientReportView project={project} blueprint={blueprint} isAgency={isAgency} />
      ) : (
      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto justify-start gap-1 bg-secondary/50 p-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs sm:text-sm">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-5 space-y-5">
          <BlueprintSection title="Executive Summary" content={blueprint.executiveSummary} />
          <BlueprintSection title="App Architecture" content={blueprint.appArchitecture} />
        </TabsContent>

        <TabsContent value="entities" className="mt-5 space-y-5">
          <InfoCard topic="cleanData" />
          <BlueprintSection title="Entity Plan" description="Entities, fields, relationships, and ownership rules." content={blueprint.entityPlan} />
        </TabsContent>

        <TabsContent value="permissions" className="mt-5 space-y-5">
          <InfoCard topic="ownerId" />
          <BlueprintSection title="Roles & Permissions" description="Role access, CRUD recommendations, admin-only areas, and ownership checks." content={blueprint.rolePermissionPlan} />
        </TabsContent>

        <TabsContent value="pages" className="mt-5">
          <BlueprintSection title="Page Plan" description="Public, user, admin, detail, and settings pages." content={blueprint.pagePlan} />
        </TabsContent>

        <TabsContent value="workflows" className="mt-5">
          <BlueprintSection title="Workflows" description="Triggers, user/system actions, status changes, and notifications." content={blueprint.workflowPlan} />
        </TabsContent>

        <TabsContent value="backend" className="mt-5 space-y-5">
          <InfoCard topic="backendFunctions" />
          <BlueprintSection title="Backend Functions" description="Function purpose, inputs/outputs, security, and error handling." content={blueprint.backendFunctionPlan} />
        </TabsContent>

        <TabsContent value="integrations" className="mt-5">
          <BlueprintSection title="Integrations" description="Purpose, required data, backend needs, and security notes." content={blueprint.integrationPlan} />
        </TabsContent>

        <TabsContent value="roadmap" className="mt-5 space-y-5">
          <InfoCard topic="phases" />
          <BlueprintSection title="MVP Roadmap" description="Phased build order and future upgrades." content={blueprint.mvpRoadmap} />
        </TabsContent>

        <TabsContent value="security" className="mt-5 space-y-5">
          <InfoCard topic="securityPrompts" />
          <BlueprintSection title="Security Notes" description="Findings detected during architecture review.">
            <SecurityFindings findings={findings} />
          </BlueprintSection>
        </TabsContent>

        <TabsContent value="qa" className="mt-5 space-y-5">
          <InfoCard topic="qaPrompts" />
          <BlueprintSection title="QA Checklist" description="Tap an item to cycle pending → passed → failed.">
            <QAChecklistView items={qaItems} onUpdate={reloadQA} />
          </BlueprintSection>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}