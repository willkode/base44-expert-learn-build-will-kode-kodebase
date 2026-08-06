import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { trackCTA } from "@/lib/analytics";
import LatestVideoFeature from "./videos/LatestVideoFeature";
import LatestVideoTile from "./videos/LatestVideoTile";

export default function LatestVideos() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    base44.functions
      .invoke("fetchYoutubeVideos", {})
      .then((res) =>
        setVideos(
          (res.data?.videos || []).slice(0, 4).map((v) => ({
            id: v.videoId,
            title: v.title,
            youtubeUrl: v.url,
            coverImageUrl: v.thumbnail,
          }))
        )
      )
      .catch(() => setVideos([]));
  }, []);

  if (!videos.length) return null;

  const [featured, ...rest] = videos;
  const trackVideo = (video) => () =>
    trackCTA({ text: video.title, location: "home_latest_videos", destination: video.youtubeUrl });

  return (
    <section className="border-t border-border/60 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Latest Videos</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-sora text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Watch and learn.
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Live builds, tutorials, and breakdowns from the channel.
            </p>
          </div>
          <Link
            to="/learn/videos"
            onClick={() => trackCTA({ text: "View all videos", location: "home_latest_videos", destination: "/learn/videos" })}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:opacity-80"
          >
            View all videos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <LatestVideoFeature video={featured} onClick={trackVideo(featured)} />
          <div className="grid content-start gap-5">
            {rest.map((v) => (
              <LatestVideoTile key={v.id} video={v} onClick={trackVideo(v)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}