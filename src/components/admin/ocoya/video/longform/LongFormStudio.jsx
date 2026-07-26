import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clapperboard, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import LongFormIdeas from "./LongFormIdeas";
import ProjectWizard from "./ProjectWizard";
import ProjectWorkspace from "./ProjectWorkspace";
import { STATUS_LABELS } from "./longFormOptions";
import { trackEvent } from "@/lib/analytics";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "DRAFT", label: "Draft" },
  { id: "STORYBOARDING", label: "Storyboard" },
  { id: "READY_TO_RENDER", label: "Ready to render" },
  { id: "COMPLETE", label: "Complete" },
];

export default function LongFormStudio() {
  const [projects, setProjects] = useState(null);
  const [active, setActive] = useState(null);
  const [wizard, setWizard] = useState(false);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);
  const [prefill, setPrefill] = useState(null);
  const [ideas, setIdeas] = useState(null);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState(null);

  const suggest = async () => {
    setIdeasLoading(true);
    setIdeasError(null);
    setIdeas(null);
    try {
      const { data } = await base44.functions.invoke("suggestLongFormVideoIdeas", {});
      if (data?.error) throw new Error(data.error);
      setIdeas(data?.ideas || []);
      trackEvent("video_studio_ideas_suggested", { count: (data?.ideas || []).length });
    } catch (e) {
      setIdeasError(e.message || "Could not generate ideas.");
    }
    setIdeasLoading(false);
  };

  const useIdea = (idea) => {
    setPrefill(idea);
    setWizard(true);
    setIdeas(null);
    trackEvent("video_studio_idea_used", { platform: idea.platform });
  };

  useEffect(() => {
    base44.entities.VideoProject.filter({ archived: false }, "-updated_date", 50).then(setProjects);
  }, []);

  const create = async (form) => {
    setCreating(true);
    setError(null);
    try {
      const user = await base44.auth.me();
      const record = await base44.entities.VideoProject.create({ ...form, user_id: user.id, archived: false });
      setProjects((prev) => [record, ...(prev || [])]);
      setWizard(false);
      setActive(record);
      trackEvent("video_studio_project_created", { platform: form.platform, duration: form.target_duration });
    } catch (e) {
      setError(e.message || "Could not create the project.");
    }
    setCreating(false);
  };

  const remove = async (project) => {
    setProjects((prev) => prev.filter((p) => p.id !== project.id));
    const scenes = await base44.entities.VideoScene.filter({ project_id: project.id });
    for (const s of scenes) await base44.entities.VideoScene.delete(s.id);
    await base44.entities.VideoProject.delete(project.id);
  };

  if (active) {
    return (
      <ProjectWorkspace
        project={active}
        onBack={() => setActive(null)}
        onProjectChange={(p) => {
          setActive(p);
          setProjects((prev) => (prev || []).map((x) => (x.id === p.id ? p : x)));
        }}
      />
    );
  }

  if (projects === null) return <LoadingState label="Loading video projects..." />;

  const visible = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-sora font-semibold text-lg">Long-Form AI Video Studio</h2>
          <p className="text-sm text-muted-foreground">
            Build longer narrated videos from multiple 8-second AI scenes with consistent style and continuity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={suggest} disabled={ideasLoading}>
            {ideasLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Suggest with AI
          </Button>
          <Button onClick={() => { setPrefill(null); setWizard((v) => !v); }}><Plus className="w-4 h-4" /> Create new video</Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <LongFormIdeas
        ideas={ideas}
        loading={ideasLoading}
        error={ideasError}
        onUse={useIdea}
        onDismiss={() => { setIdeas(null); setIdeasError(null); }}
      />

      {wizard && (
        <ProjectWizard
          key={prefill?.title || "blank"}
          initial={prefill}
          onCreate={create}
          creating={creating}
          onCancel={() => setWizard(false)}
        />
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button key={f.id} size="sm" variant={filter === f.id ? "default" : "outline"} onClick={() => setFilter(f.id)}>
            {f.label}
          </Button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-10 text-center">
          <Clapperboard className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="font-sora font-semibold mb-1">No video projects yet</p>
          <p className="text-sm text-muted-foreground">Create one to turn a brief into a fully narrated multi-scene video.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-start gap-3">
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} alt="" className="h-16 w-12 rounded-lg object-cover border border-border" />
                ) : (
                  <span className="flex h-16 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Clapperboard className="w-5 h-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-sora font-semibold truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.aspect_ratio} · {p.platform} · target {p.target_duration}s
                    {p.actual_duration ? ` · actual ${p.actual_duration}s` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.approved_scene_count || 0}/{p.scene_count || 0} scenes approved
                  </p>
                </div>
                <Badge variant="secondary">{STATUS_LABELS[p.status] || p.status}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setActive(p)}>Continue editing</Button>
                {p.final_video_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={p.final_video_url} download>Download</a>
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-destructive ml-auto" onClick={() => remove(p)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}