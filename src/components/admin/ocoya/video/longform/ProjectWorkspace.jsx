import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import ScriptPanel from "./ScriptPanel";
import SceneCard from "./SceneCard";
import SequencePlayer from "./SequencePlayer";
import RenderPanel from "./RenderPanel";
import { STATUS_LABELS } from "./longFormOptions";
import { trackEvent } from "@/lib/analytics";

export default function ProjectWorkspace({ project: initial, onBack, onProjectChange }) {
  const [project, setProject] = useState(initial);
  const [scenes, setScenes] = useState(null);
  const [busy, setBusy] = useState(null);
  const [sceneBusy, setSceneBusy] = useState({});
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    base44.entities.VideoScene.filter({ project_id: initial.id }, "scene_number").then(setScenes);
  }, [initial.id]);

  const refreshProject = async () => {
    const fresh = await base44.entities.VideoProject.get(project.id);
    setProject(fresh);
    onProjectChange?.(fresh);
  };

  const call = async (fn, payload) => {
    try {
      const res = await base44.functions.invoke(fn, payload);
      if (res.data?.error) return { error: res.data.error };
      return res.data;
    } catch (e) {
      return { error: e?.response?.data?.error || e.message || "Request failed." };
    }
  };

  const generateScript = async () => {
    setBusy("script");
    setError(null);
    const data = await call("videoStudioPlan", { action: "script", projectId: project.id });
    if (data.error) setError(data.error);
    else await refreshProject();
    setBusy(null);
  };

  const splitScenes = async (script) => {
    setBusy("scenes");
    setError(null);
    setWarnings([]);
    const data = await call("videoStudioPlan", { action: "scenes", projectId: project.id, script });
    if (data.error) setError(data.error);
    else {
      setWarnings(data.warnings || []);
      setScenes(await base44.entities.VideoScene.filter({ project_id: project.id }, "scene_number"));
      await refreshProject();
      trackEvent("video_studio_scenes_built", { scenes: data.scenes?.length || 0 });
    }
    setBusy(null);
  };

  const updateScene = (updated) => setScenes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

  const persistScene = (scene) =>
    base44.entities.VideoScene.update(scene.id, {
      narration: scene.narration,
      visual_prompt: scene.visual_prompt,
      caption_text: scene.caption_text || scene.narration,
    });

  const runScene = async (scene, action) => {
    setSceneBusy((b) => ({ ...b, [scene.id]: action }));
    await persistScene(scene);
    const data = await call("videoStudioScene", { action, sceneId: scene.id });
    if (data.error) {
      updateScene({ ...scene, error_message: data.error, status: action === "video" ? "FAILED" : scene.status });
    } else if (data.scene) {
      updateScene(data.scene);
      if (action === "video") trackEvent("video_studio_scene_generated", { scene: scene.scene_number });
    }
    setSceneBusy((b) => ({ ...b, [scene.id]: null }));
  };

  const moveScene = async (scene, delta) => {
    const ordered = [...scenes].sort((a, b) => a.scene_number - b.scene_number);
    const i = ordered.findIndex((s) => s.id === scene.id);
    const j = i + delta;
    if (j < 0 || j >= ordered.length) return;
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    const renumbered = ordered.map((s, idx) => ({ ...s, scene_number: idx + 1 }));
    setScenes(renumbered);
    await base44.entities.VideoScene.bulkUpdate(renumbered.map((s) => ({ id: s.id, scene_number: s.scene_number })));
  };

  const toggleApprove = async (scene) => {
    const approval_status = scene.approval_status === "approved" ? "pending" : "approved";
    updateScene({ ...scene, approval_status });
    await base44.entities.VideoScene.update(scene.id, { approval_status });
  };

  const toggleLock = async (scene) => {
    updateScene({ ...scene, is_locked: !scene.is_locked });
    await base44.entities.VideoScene.update(scene.id, { is_locked: !scene.is_locked });
  };

  const deleteScene = async (scene) => {
    setScenes((prev) => prev.filter((s) => s.id !== scene.id));
    await base44.entities.VideoScene.delete(scene.id);
  };

  const ordered = (scenes || []).slice().sort((a, b) => a.scene_number - b.scene_number);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4" /> All projects</Button>
        <h2 className="font-sora font-semibold text-lg">{project.title}</h2>
        <Badge variant="secondary">{STATUS_LABELS[project.status] || project.status}</Badge>
        <span className="text-xs text-muted-foreground">
          {project.aspect_ratio} · {project.platform} · target {project.target_duration}s · voice {project.voice}
        </span>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <ScriptPanel
        key={project.script}
        project={project}
        busy={busy}
        onGenerateScript={generateScript}
        onSplitScenes={splitScenes}
        hasScenes={ordered.length > 0}
      />

      {warnings.length > 0 && (
        <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm space-y-1">
          {warnings.map((w, i) => <p key={i} className="text-yellow-200">{w}</p>)}
        </div>
      )}

      {scenes === null ? (
        <LoadingState label="Loading scenes..." />
      ) : ordered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-10 text-center">
          <p className="font-sora font-semibold mb-1">No scenes yet</p>
          <p className="text-sm text-muted-foreground">Generate or paste a script above, then split it into scenes.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-sora font-semibold">Scenes ({ordered.length})</h3>
            <span className="text-xs text-muted-foreground">
              {ordered.filter((s) => s.video_url).length} clips ready · {ordered.filter((s) => s.approval_status === "approved").length} approved
            </span>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              disabled={Object.values(sceneBusy).some(Boolean)}
              onClick={async () => {
                for (const s of ordered) {
                  if (s.video_url || s.is_locked) continue;
                  if (!s.audio_url) await runScene(s, "voice");
                  await runScene(s, "video");
                }
              }}
            >
              {Object.values(sceneBusy).some(Boolean) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Generate all remaining scenes
            </Button>
          </div>

          <div className="space-y-4">
            {ordered.map((s, i) => (
              <SceneCard
                key={s.id}
                scene={s}
                busy={sceneBusy[s.id]}
                isFirst={i === 0}
                isLast={i === ordered.length - 1}
                onChange={updateScene}
                onPersist={() => persistScene(s)}
                onGenerate={(action) => runScene(s, action)}
                onShorten={() => runScene(s, "shorten")}
                onMove={(d) => moveScene(s, d)}
                onApprove={() => toggleApprove(s)}
                onToggleLock={() => toggleLock(s)}
                onDelete={() => deleteScene(s)}
              />
            ))}
          </div>

          <SequencePlayer scenes={ordered} aspectRatio={project.aspect_ratio} />
          <RenderPanel project={project} scenes={ordered} />
        </>
      )}
    </div>
  );
}