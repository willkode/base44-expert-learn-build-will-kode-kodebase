import React from "react";
import { Calendar } from "lucide-react";
import LearnPagePlaceholder from "@/components/learn/LearnPagePlaceholder";

export default function Events() {
  return (
    <LearnPagePlaceholder
      title="Events"
      description="Live workshops, webinars, and community events to level up your building skills."
      icon={Calendar}
    />
  );
}