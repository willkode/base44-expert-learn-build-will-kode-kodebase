import React from "react";
import { Play } from "lucide-react";

function getYoutubeId(url = "") {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

export function videoThumb(video) {
  const id = getYoutubeId(video.youtubeUrl);
  return video.coverImageUrl || (id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null);
}

// Small horizontal tile used in the side column of the Latest Videos section
export default function LatestVideoTile({ video, onClick }) {
  const cover = videoThumb(video);

  return (
    <a
      href={video.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="group grid grid-cols-[40%_1fr] items-stretch overflow-hidden rounded-xl border border-border bg-card/60 transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-video overflow-hidden bg-secondary">
        {cover && (
          <img
            src={cover}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-4 w-4 fill-current ml-0.5" />
          </span>
        </span>
      </div>
      <div className="flex flex-col justify-center gap-1.5 p-4 sm:p-5">
        {video.category && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">{video.category}</span>
        )}
        <h3 className="font-sora text-sm font-bold leading-snug sm:text-base line-clamp-2">{video.title}</h3>
      </div>
    </a>
  );
}