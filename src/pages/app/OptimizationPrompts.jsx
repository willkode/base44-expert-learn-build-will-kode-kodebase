import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import OptimizationPromptCard from "@/components/optimization/OptimizationPromptCard";
import PromptGenerator from "@/components/optimization/PromptGenerator";

const FILTERS = ["all", "UI Redesign", "Sales Copy", "SEO", "Conversion", "Performance"];

export default function OptimizationPrompts() {
  const { project } = useOutletContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState([]);
  const [filter, setFilter] = useState("all");

  const loadPrompts = () => {
    base44.entities.OptimizationPrompt.filter({ projectId: project.id }, "-created_date").then((p) => {
      setPrompts(p);
      setLoading(false);
    });
  };

  useEffect(loadPrompts, [project.id]);

  const filtered = prompts.filter((p) => filter === "all" || p.category === filter);

  if (loading) return <LoadingState label="Loading optimization prompts..." />;

  if (prompts.length === 0) {
    return (
      <div className="space-y-5">
        <EmptyState
          icon={Sparkles}
          title="No optimization prompts yet"
          description={`Optimization prompts are generated together with the blueprint. Generate a blueprint for "${project.projectName}" from the Overview tab to get focused prompts for UI redesign, sales copy, and SEO.`}
          actionLabel="Go to Overview"
          onAction={() => navigate(`/projects/${project.id}/overview`)}
        />
        <PromptGenerator project={project} onCreated={loadPrompts} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card/70 p-6">
        <h2 className="font-sora font-semibold text-lg">Optimization Prompts</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Focused prompts to redesign pages, sharpen sales copy, and improve SEO — tailored to this app's blueprint.
        </p>
      </div>

      <PromptGenerator project={project} onCreated={loadPrompts} />

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