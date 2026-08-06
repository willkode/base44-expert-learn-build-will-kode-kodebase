import React from "react";
import { Play } from "lucide-react";
import { videoThumb } from "./LatestVideoTile";

// Large featured video card for the Latest Videos section
export default function LatestVideoFeature({ video, onClick }) {
  const cover = videoThumb(video);

  return (
    <a
      href={video.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/60 transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-video overflow-hidden bg-secondary">
        {cover && (
          <img
            src={cover}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
          Latest
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-7 w-7 fill-current ml-1" />
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2 p-6">
        {video.category && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">{video.category}</span>
        )}
        <h3 className="font-sora text-xl font-bold leading-snug sm:text-2xl">{video.title}</h3>
      </div>
    </a>
  );
}