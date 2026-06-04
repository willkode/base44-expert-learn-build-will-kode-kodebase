import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

function getYoutubeId(url = "") {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

export default function VideoCard({ video }) {
  const id = getYoutubeId(video.youtubeUrl);
  const fallbackThumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  const cover = video.coverImageUrl || fallbackThumb;

  return (
    <motion.a
      href={video.youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/70 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden bg-secondary">
        {cover && (
          <img src={cover} alt={video.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </span>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-5">
        {video.category && <Badge variant="secondary" className="text-xs w-fit mb-2">{video.category}</Badge>}
        <h3 className="font-sora font-bold text-lg leading-snug">{video.title}</h3>
        {video.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-2 line-clamp-3">{video.description}</p>
        )}
      </div>
    </motion.a>
  );
}