import React from "react";
import { Newspaper } from "lucide-react";
import LearnPagePlaceholder from "@/components/learn/LearnPagePlaceholder";

export default function Blog() {
  return (
    <LearnPagePlaceholder
      title="Blog"
      description="Articles, tutorials, and deep dives on building production-grade apps with Base44."
      icon={Newspaper}
    />
  );
}