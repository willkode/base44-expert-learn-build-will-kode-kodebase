import React from "react";
import { Sparkles } from "lucide-react";
import BlogPlaceholder from "@/components/admin/blog/BlogPlaceholder";

export default function BlogGenerator() {
  return (
    <BlogPlaceholder
      title="AI Blog Generator"
      description="Generate complete, SEO-optimized blog articles with AI."
      icon={Sparkles}
      emptyTitle="Generator coming online next"
      emptyDescription="The AI generation engine will let you turn a topic, keyword, or brief into a full article with a featured image and SEO metadata."
    />
  );
}