import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Wand2, Hash, Image as ImageIcon, Send, Check, X } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PLATFORMS } from "@/components/admin/social/socialConfig";
import { PREVIEW_MAP } from "@/components/admin/social/PlatformPreviews";
import { trackEvent } from "@/lib/analytics";

const COMING_SOON = "AI generation is set up in the next step.";

export default function SocialStudio() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [brief, setBrief] = useState("");
  const [selected, setSelected] = useState(["twitter", "linkedin"]);
  const [draft, setDraft] = useState({ content: "", hashtags: [], image_url: "", platform_variants: {} });

  useEffect(() => {
    trackEvent("admin_social_studio_view");
    base44.entities.SocialCampaign.list("-created_date", 100).then((c) => {
      setCampaigns(c);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState label="Loading content studio..." />;

  const togglePlatform = (key) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));

  const post = { ...draft, content: draft.content || brief, selected_platforms: selected };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Studio"
        description="Generate AI posts, tailor platform variants, and preview before approval."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composer */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
            <div>
              <Label className="mb-1.5 block">Campaign (optional)</Label>
              <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="">No campaign</option>
                {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <Label className="mb-1.5 block">What's this post about?</Label>
              <Textarea
                rows={4}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Describe your topic, announcement, or offer..."
              />
            </div>

            <div>
              <Label className="mb-2 block">Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => togglePlatform(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                      selected.includes(key)
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" disabled title={COMING_SOON}><Wand2 className="w-4 h-4 mr-1.5" /> Generate Post</Button>
              <Button variant="outline" disabled title={COMING_SOON}><Hash className="w-4 h-4 mr-1.5" /> Hashtags</Button>
              <Button variant="outline" disabled title={COMING_SOON}><ImageIcon className="w-4 h-4 mr-1.5" /> Image Prompt</Button>
              <Button variant="outline" disabled title={COMING_SOON}><Sparkles className="w-4 h-4 mr-1.5" /> Generate Image</Button>
            </div>
            <p className="text-xs text-muted-foreground">{COMING_SOON}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
            <Label className="block">Post content</Label>
            <Textarea
              rows={5}
              value={draft.content}
              onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
              placeholder="Edit the post content here..."
            />
            <div>
              <Label className="mb-1.5 block">Image URL</Label>
              <Input
                value={draft.image_url}
                onChange={(e) => setDraft((d) => ({ ...d, image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button disabled title={COMING_SOON}><Send className="w-4 h-4 mr-1.5" /> Submit for Approval</Button>
              <Button variant="outline" disabled title={COMING_SOON}><Check className="w-4 h-4 mr-1.5" /> Approve</Button>
              <Button variant="outline" disabled title={COMING_SOON}><X className="w-4 h-4 mr-1.5" /> Reject</Button>
            </div>
          </div>
        </div>

        {/* Previews */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-sora font-semibold">Platform Previews</h2>
            <Badge variant="secondary" className="text-xs">{selected.length} selected</Badge>
          </div>
          {selected.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center rounded-2xl border border-dashed border-border">
              Select at least one platform to preview.
            </p>
          ) : (
            selected.map((key) => {
              const Preview = PREVIEW_MAP[key];
              return Preview ? <Preview key={key} post={post} /> : null;
            })
          )}
        </div>
      </div>
    </div>
  );
}