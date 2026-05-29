import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import OptimizationPromptCard from "@/components/optimization/OptimizationPromptCard";

const FILTERS = ["all", "UI Redesign", "Sales Copy", "SEO", "Conversion", "Performance"];

export default function OptimizationPrompts() {
  const { project } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [filter, setFilter] = useState("all");

  const loadPrompts = () => {
    base44.entities.OptimizationPrompt.filter({ projectId: project.id }, "-created_date").then((p) => {
      setPrompts(p);
      setLoading(false);
    });
  };

  useEffect(loadPrompts, [project.id]);

  const generate = async () => {
    setRunning(true);
    try {
      const res = await base44.functions.invoke("generateOptimizationPrompts", { projectId: project.id });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success(`Generated ${res.data.count} optimization prompts`);
      loadPrompts();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Failed to generate prompts");
    } finally {
      setRunning(false);
    }
  };

  const filtered = prompts.filter((p) => filter === "all" || p.category === filter);

  if (loading) return <LoadingState label="Loading optimization prompts..." />;

  if (prompts.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No optimization prompts yet"
        description={`Generate ready-to-paste prompts to redesign pages, sharpen sales copy, and improve SEO for "${project.projectName}". Requires a generated blueprint.`}
        actionLabel={running ? "Generating..." : "Generate Optimization Prompts"}
        onAction={running ? undefined : generate}
      />
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
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                filter === f ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
        <Button variant="outline" onClick={generate} disabled={running}>
          {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />} Re-generate
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No prompts match this filter.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <OptimizationPromptCard key={p.id} prompt={p} onUpdate={loadPrompts} />
          ))}
        </div>
      )}
    </div>
  );
}