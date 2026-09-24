import React from "react";
import { Play } from "lucide-react";

// Featured media for a LibraryPrompt. When `videoUrl` is set it replaces the
// featured image; it can be a YouTube link or an uploaded video file.
//   variant="card"  — autoplaying muted loop (file) or YouTube thumbnail + play badge
//   variant="hero"  — full player (file with controls, or YouTube embed)
//   variant="thumb" — static first frame / YouTube thumbnail, no badge

export function getYoutubeId(url = "") {
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : null;
}

export default function PromptMedia({ prompt, variant = "card", fallbackImage, className = "", alt }) {
  const video = (prompt.videoUrl || "").trim();
  const image = prompt.imageUrl || fallbackImage;
  const label = alt ?? prompt.title;

  if (!video) {
    return image ? <img src={image} alt={label} loading="lazy" className={className} /> : null;
  }

  const ytId = getYoutubeId(video);

  if (ytId) {
    if (variant === "hero") {
      return (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}`}
          title={label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={className}
        />
      );
    }
    const thumb = <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={label} loading="lazy" className={className} />;
    if (variant === "thumb") return thumb;
    return (
      <>
        {thumb}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </span>
        </span>
      </>
    );
  }

  if (variant === "hero") {
    return <video src={video} poster={prompt.imageUrl || undefined} controls playsInline preload="metadata" className={className} />;
  }
  if (variant === "thumb") {
    // #t= makes browsers render a frame instead of a blank box
    return <video src={`${video}#t=0.1`} muted playsInline preload="metadata" className={className} aria-label={label} />;
  }
  return (
    <video
      src={video}
      poster={image || undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className={className}
      aria-label={label}
    />
  );
}
