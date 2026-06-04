import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { format } from "date-fns";

export default function VideoCard({ video, index = 0 }) {
  return (
    <motion.a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: (index % 3) * 0.05 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/70 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 shadow-lg">
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </span>
        </span>
      </div>
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-sora font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        {video.published && (
          <p className="text-xs text-muted-foreground mt-auto">
            {format(new Date(video.published), "MMM d, yyyy")}
          </p>
        )}
      </div>
    </motion.a>
  );
}