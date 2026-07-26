import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import OcoyaProfilePicker from "@/components/admin/ocoya/OcoyaProfilePicker";
import SocialVideoForm from "./SocialVideoForm";
import SocialVideoCard from "./SocialVideoCard";
import { FOOTER_CTA } from "./videoOptions";
import { trackEvent } from "@/lib/analytics";

export default function OcoyaVideoStudio({ workspaceId }) {
  const [videos, setVideos] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    base44.entities.SocialVideo.list("-created_date", 30).then(setVideos);
  }, []);

  const generate = async (form) => {
    setGenerating(true);
    setError(null);
    let res;
    try {
      res = await base44.functions.invoke("generateSocialVideo", {
        script: form.script,
        videoDetails: form.videoDetails,
        platform: form.platform,
        voice: form.voice,
        duration: form.duration,
        aspectRatio: form.aspectRatio,
      });
    } catch (e) {
      setGenerating(false);
      setError(e?.response?.data?.error || e.message || "Video generation failed.");
      return;
    }
    setGenerating(false);
    if (res.data?.error) {
      setError(res.data.error);
      return;
    }
    const record = await base44.entities.SocialVideo.create({
      title: res.data.suggestedTitle || form.platform + " video",
      platform: form.platform,
      script: form.script,
      videoDetails: form.videoDetails,
      aspectRatio: res.data.aspectRatio,
      durationSeconds: res.data.duration,
      voice: form.voice,
      videoUrl: res.data.videoUrl,
      voiceoverUrl: res.data.voiceoverUrl,
      musicUrl: form.musicUrl,
      onScreenText: res.data.onScreenText,
      hashtags: res.data.hashtags,
      caption: "",
      status: "ready",
    });
    setVideos((prev) => [record, ...prev]);
    trackEvent("social_video_generated", { platform: form.platform, duration: form.duration });
  };

  const updateVideo = (updated) => setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));

  const persist = (video) =>
    base44.entities.SocialVideo.update(video.id, { caption: video.caption || "" });

  const sendToOcoya = async (video) => {
    if (profiles.length === 0) {
      updateVideo({ ...video, error: "Select at least one social profile above first." });
      return;
    }
    updateVideo({ ...video, busy: true, error: null });
    const caption = [video.caption, (video.hashtags || []).join(" "), FOOTER_CTA]
      .filter(Boolean)
      .join("\n\n");
    let res;
    try {
      res = await base44.functions.invoke("ocoyaRequest", {
        action: "createPost",
        workspaceId,
        caption,
        mediaUrls: [video.videoUrl],
        socialProfileIds: profiles,
        scheduledAt: new Date().toISOString(),
      });
    } catch (e) {
      updateVideo({ ...video, busy: false, error: e?.response?.data?.error || e.message || "Sending failed." });
      return;
    }
    if (res.data?.error) {
      updateVideo({ ...video, busy: false, error: res.data.error });
      return;
    }
    trackEvent("social_video_sent", { platform: video.platform });
    updateVideo({ ...video, busy: false, status: "sent" });
    await base44.entities.SocialVideo.update(video.id, {
      caption: video.caption || "",
      status: "sent",
      sentAt: new Date().toISOString(),
    });
  };

  const discard = (video) => {
    setVideos((prev) => prev.filter((v) => v.id !== video.id));
    base44.entities.SocialVideo.delete(video.id);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <SocialVideoForm onGenerate={generate} generating={generating} />
      {error && <p className="text-sm text-destructive">{error}</p>}

      {videos.length > 0 && (
        <>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-sora font-semibold mb-3">Publish to</h3>
            <OcoyaProfilePicker workspaceId={workspaceId} selected={profiles} onChange={setProfiles} />
          </div>
          <div className="space-y-4">
            {videos.map((v) => (
              <SocialVideoCard
                key={v.id}
                video={v}
                onChange={updateVideo}
                onPersist={() => persist(v)}
                onSend={() => sendToOcoya(v)}
                onDiscard={() => discard(v)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}