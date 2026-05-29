import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, RefreshCw, Download, Copy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { securityMarkdown, securityFindingsText, copyText, downloadMarkdown } from "@/lib/exporters";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import FindingCard from "@/components/security/FindingCard";

const FILTERS = ["all", "unresolved", "reviewed", "critical", "high", "medium", "low", "resolved"];

export default function SecurityReview() {
  const { project } = useOutletContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [findings, setFindings] = useState([]);
  const [filter, setFilter] = useState("unresolved");

  const loadFindings = () => {
    base44.entities.SecurityFinding.filter({ projectId: project.id }, "-severity").then((f) => {
      setFindings(f);
      setLoading(false);
    });
  };

  useEffect(loadFindings, [project.id]);

  const runReview = async () => {
    setRunning(true);
    try {
      const res = await base44.functions.invoke("runSecurityReview", { projectId: project.id });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`Security review complete — ${res.data.count} findings`);
      loadFindings();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Security review failed");
    } finally {
      setRunning(false);
    }
  };

  const filtered = findings.filter((f) => {
    if (filter === "all") return true;
    if (filter === "resolved") return f.fixedStatus === "resolved";
    if (filter === "reviewed") return f.fixedStatus === "reviewed";
    if (filter === "unresolved") return f.fixedStatus !== "resolved";
    return f.severity === filter;
  });

  if (loading) return <LoadingState label="Loading security review..." />;

  const RunButton = (
    <Button onClick={runReview} disabled={running} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
      {running ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...</> : <><ShieldCheck className="w-4 h-4 mr-2" /> Run Security Review</>}
    </Button>
  );

  if (findings.length === 0) {
    return (
      <div className="space-y-5">
        <EmptyState
          icon={ShieldCheck}
          title="No security review yet"
          description={`Run a security review on "${project.projectName}" to surface permission gaps, ownership issues, and exposed data risks. Requires a generated blueprint.`}
          actionLabel={running ? "Running..." : "Run Security Review"}
          onAction={running ? undefined : runReview}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm px-3 py-1.5 rounded-full capitalize transition-colors ${
                filter === f ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => copyText(securityFindingsText(findings), "All findings copied")}>
            <Copy className="w-4 h-4 mr-2" /> Copy all
          </Button>
          <Button variant="outline" onClick={() => downloadMarkdown(`${project.projectName}-security.md`, securityMarkdown(project, findings))}>
            <Download className="w-4 h-4 mr-2" /> Export markdown
          </Button>
          <Button variant="outline" onClick={runReview} disabled={running}>
            {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />} Re-run
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No findings match this filter.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((f) => (
            <FindingCard key={f.id} finding={f} onUpdate={loadFindings} />
          ))}
        </div>
      )}
    </div>
  );
}