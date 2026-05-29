import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ClipboardCheck, Loader2, RefreshCw, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { qaMarkdown, downloadMarkdown } from "@/lib/exporters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import QASummary from "@/components/qa/QASummary";
import QAItemCard from "@/components/qa/QAItemCard";

const CATEGORIES = [
  "Authentication", "User roles", "Entity permissions", "Forms", "Dashboard",
  "Admin tools", "Backend functions", "Integrations", "Notifications",
  "Mobile responsiveness", "Error handling", "Empty states", "Security", "Launch readiness",
];

export default function QAChecklist() {
  const { project } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const loadItems = () => {
    base44.entities.QAItem.filter({ projectId: project.id }, "-created_date").then((data) => {
      setItems(data);
      setLoading(false);
    });
  };

  useEffect(loadItems, [project.id]);

  const runChecklist = async () => {
    setRunning(true);
    try {
      const res = await base44.functions.invoke("runQAChecklist", { projectId: project.id });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`QA checklist generated — ${res.data.count} tests`);
      loadItems();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "QA checklist failed");
    } finally {
      setRunning(false);
    }
  };

  const total = items.length;
  const passed = items.filter((i) => i.status === "passed").length;
  const failed = items.filter((i) => i.status === "failed").length;
  const pending = total - passed - failed;
  const progress = total ? Math.round(((passed + failed) / total) * 100) : 0;
  const readiness = total ? Math.round((passed / total) * 100) : 0;

  const filtered = items.filter((i) =>
    (category === "all" || i.category === category) && (status === "all" || i.status === status)
  );

  if (loading) return <LoadingState label="Loading QA checklist..." />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="No QA checklist yet"
        description={`Generate a launch QA checklist for "${project.projectName}" covering all 14 test areas from authentication to launch readiness. Requires a generated blueprint.`}
        actionLabel={running ? "Generating..." : "Generate QA Checklist"}
        onAction={running ? undefined : runChecklist}
      />
    );
  }

  return (
    <div className="space-y-6">
      <QASummary total={total} passed={passed} failed={failed} pending={pending} readiness={readiness} />

      <div className="rounded-2xl border border-border bg-card/70 p-5">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-muted-foreground">Test progress</span>
          <span className="font-medium">{progress}% complete</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-3 flex-wrap">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => downloadMarkdown(`${project.projectName}-qa.md`, qaMarkdown(project, items))}>
            <Download className="w-4 h-4 mr-2" /> Export markdown
          </Button>
          <Button variant="outline" onClick={runChecklist} disabled={running}>
            {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />} Re-run
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No tests match these filters.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <QAItemCard key={item.id} item={item} onUpdate={loadItems} />
          ))}
        </div>
      )}
    </div>
  );
}