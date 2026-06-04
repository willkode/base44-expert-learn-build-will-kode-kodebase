import React, { useState, useEffect } from "react";
import { Video as VideoIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Seo from "@/components/seo/Seo";
import VideoCard from "@/components/learn/VideoCard";
import LoadingState from "@/components/shared/LoadingState";

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Video.list("order", 200).then((d) => { setVideos(d); setLoading(false); });
  }, []);

  return (
    <>
      <Seo title="Videos — KodeBase" description="Walkthroughs, demos, and step-by-step video guides for mastering Base44." />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-6xl mx-auto px-6 py-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-7">
              <VideoIcon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-sora font-extrabold text-4xl md:text-5xl tracking-tight mb-5">
              <span className="text-gradient-orange">Videos</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Walkthroughs, demos, and step-by-step video guides for mastering Base44.
            </p>
          </div>

          {loading ? (
            <LoadingState label="Loading videos..." />
          ) : videos.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">No videos yet. Check back soon.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v) => <VideoCard key={v.id} video={v} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}