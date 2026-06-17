import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Library, Video as VideoIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { fetchPublishedPosts } from "@/lib/blogPublic";
import { trackCTA } from "@/lib/analytics";
import BlogCard from "@/components/learn/BlogCard";
import VideoCard from "@/components/learn/VideoCard";

// Surfaces the app's other content hubs on the home page: latest blog posts,
// prompt library, and videos. Reuses the existing learn cards + design tokens.

function SectionHeading({ icon: Icon, eyebrow, title, to, linkLabel }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 mb-4">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-primary uppercase tracking-wider">{eyebrow}</span>
        </div>
        <h2 className="font-sora font-extrabold text-2xl md:text-3xl tracking-tight">{title}</h2>
      </div>
      <Link
        to={to}
        onClick={() => trackCTA({ text: linkLabel, location: "home_explore", destination: to })}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all whitespace-nowrap"
      >
        {linkLabel} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function PromptPreviewCard({ prompt }) {
  return (
    <Link
      to={prompt.slug ? `/learn/prompt-library/${prompt.slug}` : "/learn/prompt-library"}
      className="group flex flex-col h-full rounded-2xl border border-border bg-card/70 p-6 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
    >
      <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium w-fit mb-3">
        {prompt.category}
      </span>
      <h3 className="font-sora font-bold text-lg mb-2 group-hover:text-primary transition-colors">
        {prompt.title}
      </h3>
      {prompt.description && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
          {prompt.description}
        </p>
      )}
      {prompt.promptText && (
        <pre className="mt-auto text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3 max-h-24 overflow-hidden whitespace-pre-wrap font-inter leading-relaxed">
          {prompt.promptText}
        </pre>
      )}
    </Link>
  );
}

export default function ExploreResources() {
  const [posts, setPosts] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchPublishedPosts(6).then((p) => setPosts(p.slice(0, 3))).catch(() => {});
    base44.entities.LibraryPrompt.list("order", 3).then(setPrompts).catch(() => {});
    base44.entities.Video.list("order", 3).then(setVideos).catch(() => {});
  }, []);

  const hasAny = posts.length > 0 || prompts.length > 0 || videos.length > 0;
  if (!hasAny) return null;

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-20" />
      <div className="relative max-w-7xl mx-auto px-6 space-y-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-sora font-extrabold text-3xl md:text-5xl tracking-tight mb-4">
            Explore the <span className="text-gradient-orange">KodeBase</span> library
          </h2>
          <p className="text-lg text-muted-foreground">
            Guides, copy-paste prompts, and video walkthroughs to help you plan and ship faster.
          </p>
        </motion.div>

        {posts.length > 0 && (
          <div>
            <SectionHeading
              icon={BookOpen}
              eyebrow="From the blog"
              title="Latest articles"
              to="/learn/blog"
              linkLabel="View all posts"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {prompts.length > 0 && (
          <div>
            <SectionHeading
              icon={Library}
              eyebrow="Prompt library"
              title="Battle-tested prompts"
              to="/learn/prompt-library"
              linkLabel="Browse the library"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {prompts.map((prompt) => (
                <PromptPreviewCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div>
            <SectionHeading
              icon={VideoIcon}
              eyebrow="Watch & learn"
              title="Video walkthroughs"
              to="/learn/videos"
              linkLabel="See all videos"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}