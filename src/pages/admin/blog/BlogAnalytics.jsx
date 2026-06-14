import React from "react";
import { BarChart3 } from "lucide-react";
import BlogPlaceholder from "@/components/admin/blog/BlogPlaceholder";

export default function BlogAnalytics() {
  return (
    <BlogPlaceholder
      title="Blog Analytics"
      description="Post performance, traffic, conversions, and SEO trends."
      icon={BarChart3}
      emptyTitle="No analytics data yet"
      emptyDescription="Once posts are published and an analytics source is connected, performance metrics will appear here."
    />
  );
}