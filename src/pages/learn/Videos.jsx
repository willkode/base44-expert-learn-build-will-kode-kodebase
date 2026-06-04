import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Video, Youtube, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import VideoCard from "@/components/learn/VideoCard";

export default function Videos() {
  const { data, isLoading } = useQuery({
    queryKey: ["youtube-videos"],
    queryFn: async () => {
      const res = await base44.functions.invoke("fetchYoutubeVideos", {});
      return res.data?.videos || [];
    },
    staleTime: 1000 * 60 * 30,
  });

  const videos = data || [];

  return (
    <main className="min-h-screen bg-background pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-widest">
            <Video className="w-4 h-4" /> Videos
          </span>
          <h1 className="font-sora font-bold text-4xl md:text-5xl tracking-tight mt-4 mb-5">
            Latest from <span className="text-gradient-orange">KodeBase</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Walkthroughs, demos, and step-by-step video guides for mastering Base44.
          </p>
          <Button
            asChild
            className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <a href="https://www.youtube.com/@kodebaseofficial" target="_blank" rel="noopener noreferrer">
              <Youtube className="w-4 h-4 mr-1" /> Subscribe on YouTube
            </a>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
            Loading videos...
          </div>
        ) : videos.length === 0 ? (
          <p className="text-center text-muted-foreground py-24">
            No videos available right now. Visit the{" "}
            <a href="https://www.youtube.com/@kodebaseofficial" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              channel
            </a>{" "}
            directly.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v, i) => (
              <VideoCard key={v.videoId} video={v} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}