import React from "react";
import { CalendarDays } from "lucide-react";
import BlogPlaceholder from "@/components/admin/blog/BlogPlaceholder";

export default function BlogCalendar() {
  return (
    <BlogPlaceholder
      title="Content Calendar"
      description="View scheduled blog posts by day, week, or month."
      icon={CalendarDays}
      emptyTitle="No scheduled posts yet"
      emptyDescription="Posts you schedule will appear here on a calendar so you can plan your publishing cadence."
    />
  );
}