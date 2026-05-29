import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Wand2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import PromptCard from "@/components/blueprint/PromptCard";

export default function PromptPackViewer() {
  const { project } = useOutletContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pack, setPack] = useState(null);
  const [items, setItems] = useState([]);

  const loadData = () => {
    Promise.all([
      base44.entities.PromptPack.filter({ projectId: project.id }, "-created_date", 1),
      base44.entities.PromptItem.filter({ projectId: project.id }, "promptNumber"),
    ]).then(([p, i]) => {
      setPack(p[0] || null);
      setItems(i);
      setLoading(false);
    });
  };

  useEffect(loadData, [project.id]);

  const reloadItems = () => {
    base44.entities.PromptItem.filter({ projectId: project.id }, "promptNumber").then(setItems);
  };

  if (loading) return <LoadingState label="Loading prompt pack..." />;

  if (!pack || items.length === 0) {
    return (
      <EmptyState
        icon={Wand2}
        title="No prompt pack yet"
        description={`Generate a blueprint for "${project.projectName}" from the Overview tab — the prompt pack is created with it.`}
        actionLabel="Go to Overview"
        onAction={() => navigate(`/projects/${project.id}/overview`)}
      />
    );
  }

  const completed = items.filter((i) => i.status === "completed").length;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card/70 p-6">
        <h2 className="font-sora font-semibold text-lg">{pack.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{pack.description}</p>
        <p className="text-sm text-muted-foreground mt-3">
          <span className="text-foreground font-medium">{completed}</span> of{" "}
          <span className="text-foreground font-medium">{items.length}</span> prompts completed
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <PromptCard key={item.id} prompt={item} onUpdate={reloadItems} />
        ))}
      </div>
    </div>
  );
}