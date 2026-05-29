import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Wand2, Copy, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import PromptCard from "@/components/blueprint/PromptCard";
import { promptPackMarkdown, allPromptsText, copyText, downloadMarkdown } from "@/lib/exporters";

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

  const markAllCompleted = async () => {
    await Promise.all(
      items.map((item) =>
        base44.entities.PromptItem.update(item.id, { status: "completed" })
      )
    );
    reloadItems();
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
        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => copyText(allPromptsText(items), "All prompts copied")}>
            <Copy className="w-4 h-4 mr-1.5" /> Copy all prompts
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadMarkdown(`${project.projectName}-prompts.md`, promptPackMarkdown(project, pack, items))}>
            <Download className="w-4 h-4 mr-1.5" /> Export markdown
          </Button>
          <Button variant="outline" size="sm" onClick={markAllCompleted}>
            Mark all completed
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <PromptCard key={item.id} prompt={item} onUpdate={reloadItems} />
        ))}
      </div>
    </div>
  );
}