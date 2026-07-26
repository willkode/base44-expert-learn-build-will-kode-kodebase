import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Sparkles, Wand2, Loader2 } from "lucide-react";
import OcoyaProfilePicker from "@/components/admin/ocoya/OcoyaProfilePicker";
import OcoyaDraftCard from "@/components/admin/ocoya/OcoyaDraftCard";
import OcoyaSlotPicker from "@/components/admin/ocoya/OcoyaSlotPicker";
import OcoyaBulkApproveBar from "@/components/admin/ocoya/OcoyaBulkApproveBar";
import { nextOpenSlots, slotLabelCST } from "@/components/admin/ocoya/ocoyaAutoSlots";
import { IMAGE_STYLES } from "@/components/admin/ocoya/OcoyaCreatePost";
import { trackEvent } from "@/lib/analytics";

const MODES = [
  { id: "now", label: "Publish now" },
  { id: "auto", label: "Auto schedule" },
  { id: "schedule", label: "Schedule" },
  { id: "draft", label: "Save as draft" },
];

export default function OcoyaSuggest({ workspaceId }) {
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [selected, setSelected] = useState([]);
  const [includeImage, setIncludeImage] = useState(true);
  const [imageStyle, setImageStyle] = useState("brand");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [mode, setMode] = useState("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState(null);
  const [usedSlots, setUsedSlots] = useState([]);
  const [selectedDrafts, setSelectedDrafts] = useState([]);
  const [bulkSending, setBulkSending] = useState(false);

  useEffect(() => {
    base44.entities.OcoyaDraft.filter({ status: "ready" }, "-created_date", 50).then((records) => {
      setDrafts(
        records.map((r) => ({
          id: r.id,
          ideaTitle: r.ideaTitle || "Draft",
          caption: r.caption,
          imagePrompt: r.imagePrompt,
          imageUrl: r.imageUrl,
          status: "ready",
        }))
      );
    });
  }, []);

  const loadIdeas = async () => {
    setLoadingIdeas(true);
    setError(null);
    setIdeas([]);
    setSelected([]);
    const res = await base44.functions.invoke("suggestOcoyaPostIdeas", {});
    setLoadingIdeas(false);
    if (res.data?.error) {
      setError(res.data.error);
      return;
    }
    setIdeas(res.data.ideas || []);
    trackEvent("ocoya_ideas_generated");
  };

  const toggleIdea = (i) => {
    setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  const generateSelected = async () => {
    setGenerating(true);
    setError(null);
    for (let n = 0; n < selected.length; n++) {
      const idea = ideas[selected[n]];
      setProgress(`Creating post ${n + 1} of ${selected.length}: ${idea.title}...`);
      const res = await base44.functions.invoke("generateOcoyaPostContent", {
        instructions: idea.instructions,
        includeImage,
        imageStyle,
      });
      if (res.data?.caption) {
        const record = await base44.entities.OcoyaDraft.create({
          source: "suggest",
          ideaTitle: idea.title,
          instructions: idea.instructions,
          caption: res.data.caption,
          imagePrompt: res.data.imagePrompt || "",
          imageUrl: res.data.imageUrl || "",
          status: "ready",
        });
        setDrafts((prev) => [
          {
            id: record.id,
            ideaTitle: idea.title,
            caption: res.data.caption,
            imagePrompt: res.data.imagePrompt,
            imageUrl: res.data.imageUrl,
            status: "ready",
          },
          ...prev,
        ]);
      }
    }
    setGenerating(false);
    setProgress("");
    setIdeas([]);
    setSelected([]);
  };

  const updateDraft = (updated) => {
    setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const persistDraft = (draft) => {
    base44.entities.OcoyaDraft.update(draft.id, { caption: draft.caption });
  };

  const regenImage = async (draft) => {
    updateDraft({ ...draft, busy: "image" });
    const res = await base44.functions.invoke("generateOcoyaPostContent", {
      imagePrompt: draft.imagePrompt,
      imageStyle,
    });
    const imageUrl = res.data?.imageUrl || draft.imageUrl;
    updateDraft({ ...draft, busy: null, imageUrl });
    if (res.data?.imageUrl) await base44.entities.OcoyaDraft.update(draft.id, { imageUrl });
  };

  const sendDraft = async (draft, autoSlotISO) => {
    if (mode !== "draft" && profiles.length === 0) {
      updateDraft({ ...draft, error: "Select at least one social profile below, or use draft mode." });
      return false;
    }
    if (mode === "schedule" && !scheduledAt) {
      updateDraft({ ...draft, error: "Pick a schedule date and time below first." });
      return false;
    }
    let slot = autoSlotISO;
    if (mode === "auto" && !slot) {
      slot = nextOpenSlots(1, usedSlots)[0];
      setUsedSlots((prev) => [...prev, slot]);
    }
    updateDraft({ ...draft, busy: "send", error: null });
    const payload = { action: "createPost", workspaceId, caption: draft.caption };
    if (draft.imageUrl) payload.mediaUrls = [draft.imageUrl];
    if (profiles.length) payload.socialProfileIds = profiles;
    if (mode === "now") payload.scheduledAt = new Date().toISOString();
    if (mode === "schedule") payload.scheduledAt = new Date(scheduledAt).toISOString();
    if (mode === "auto") payload.scheduledAt = slot;
    let res;
    try {
      res = await base44.functions.invoke("ocoyaRequest", payload);
    } catch (e) {
      updateDraft({
        ...draft,
        busy: null,
        error: e?.response?.data?.error || e.message || "Sending to Ocoya failed.",
      });
      return false;
    }
    if (res.data?.error) {
      updateDraft({ ...draft, busy: null, error: res.data.error });
      return false;
    }
    trackEvent("ocoya_suggested_post_sent", { mode });
    updateDraft({ ...draft, busy: null, status: "sent" });
    await base44.entities.OcoyaDraft.update(draft.id, {
      caption: draft.caption,
      status: "sent",
      sentAt: new Date().toISOString(),
    });
    return true;
  };

  const toggleDraftSelect = (id) => {
    setSelectedDrafts((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const pendingDrafts = drafts.filter((d) => d.status !== "sent");

  const sendSelected = async () => {
    const queue = pendingDrafts.filter((d) => selectedDrafts.includes(d.id));
    if (queue.length === 0) return;
    setBulkSending(true);
    const slots = mode === "auto" ? nextOpenSlots(queue.length, usedSlots) : [];
    for (let i = 0; i < queue.length; i++) {
      const ok = await sendDraft(queue[i], slots[i]);
      if (ok) setSelectedDrafts((prev) => prev.filter((x) => x !== queue[i].id));
    }
    if (slots.length) setUsedSlots((prev) => [...prev, ...slots]);
    setBulkSending(false);
  };

  const discardDraft = (draft) => {
    setDrafts((prev) => prev.filter((x) => x.id !== draft.id));
    base44.entities.OcoyaDraft.delete(draft.id);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Ideas */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <h3 className="font-sora font-semibold mb-1">AI post ideas from your content</h3>
          <p className="text-xs text-muted-foreground">
            Scans your products, tools, services, blog posts, and free resources — then suggests 7 post ideas.
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-4">
          <Button onClick={loadIdeas} disabled={loadingIdeas || generating}>
            {loadingIdeas ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
            {loadingIdeas ? "Scanning your app..." : ideas.length ? "Suggest new ideas" : "Suggest 7 post ideas"}
          </Button>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={includeImage} onCheckedChange={setIncludeImage} />
            AI images
          </label>
          {includeImage && (
            <Select value={imageStyle} onValueChange={setImageStyle}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Image style" />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_STYLES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}

        {ideas.length > 0 && (
          <div className="space-y-2">
            {ideas.map((idea, i) => (
              <label
                key={i}
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  selected.includes(i) ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"
                }`}
              >
                <Checkbox checked={selected.includes(i)} onCheckedChange={() => toggleIdea(i)} className="mt-0.5" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{idea.title}</span>
                  <span className="block text-xs text-muted-foreground">{idea.description}</span>
                </span>
              </label>
            ))}
            <Button onClick={generateSelected} disabled={selected.length === 0 || generating} className="mt-2">
              {generating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1.5" />}
              {generating ? "Creating..." : `Create ${selected.length || ""} selected post${selected.length === 1 ? "" : "s"}`}
            </Button>
          </div>
        )}
        {generating && progress && <p className="text-sm text-muted-foreground">{progress}</p>}
      </div>

      {/* Drafts to review */}
      {drafts.length > 0 && (
        <>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-sora font-semibold">Publish settings (applies to each post you approve)</h3>
            <OcoyaProfilePicker workspaceId={workspaceId} selected={profiles} onChange={setProfiles} />
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    mode === m.id ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary/40"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {mode === "schedule" && <OcoyaSlotPicker value={scheduledAt} onChange={setScheduledAt} />}
            {mode === "auto" && (
              <p className="text-xs text-muted-foreground">
                Each approved post takes the next open slot (24 hours a day CST, every 30 minutes),
                rolling onto following days. Next open slot: {slotLabelCST(nextOpenSlots(1, usedSlots)[0])}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-sora font-semibold">Review & approve ({pendingDrafts.length} remaining)</h3>
            <OcoyaBulkApproveBar
              total={pendingDrafts.length}
              selectedCount={selectedDrafts.length}
              allSelected={pendingDrafts.length > 0 && selectedDrafts.length === pendingDrafts.length}
              onToggleAll={(checked) => setSelectedDrafts(checked ? pendingDrafts.map((d) => d.id) : [])}
              onSend={sendSelected}
              sending={bulkSending}
              hint={mode === "auto" ? "Selected posts get consecutive open slots." : undefined}
            />
            {drafts.map((d) => (
              <OcoyaDraftCard
                key={d.id}
                draft={d}
                onChange={updateDraft}
                onPersist={() => persistDraft(d)}
                onRegenImage={() => regenImage(d)}
                onSend={() => sendDraft(d)}
                onDiscard={() => discardDraft(d)}
                selectable
                selected={selectedDrafts.includes(d.id)}
                onToggleSelect={() => toggleDraftSelect(d.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}