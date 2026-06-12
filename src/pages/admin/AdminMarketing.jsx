import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import MarketingToolCard from "@/components/admin/marketing/MarketingToolCard";
import { Mail, Share2, PenSquare } from "lucide-react";

const tools = [
  {
    icon: Mail,
    title: "Email Marketing",
    description: "Create and send campaigns to your newsletter subscribers and users.",
    status: "Coming soon",
  },
  {
    icon: Share2,
    title: "Social Media Marketing",
    description: "Plan, generate and schedule posts across your social channels.",
    status: "Coming soon",
  },
  {
    icon: PenSquare,
    title: "Auto Blog",
    description: "Automatically generate and publish SEO-optimized blog posts.",
    status: "Coming soon",
  },
];

export default function AdminMarketing() {
  return (
    <div>
      <PageHeader
        title="Marketing"
        description="Email, social and content marketing tools for your app."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((tool) => (
          <MarketingToolCard key={tool.title} {...tool} />
        ))}
      </div>
    </div>
  );
}