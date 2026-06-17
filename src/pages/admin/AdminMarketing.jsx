import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import MarketingToolCard from "@/components/admin/marketing/MarketingToolCard";
import { Mail, Share2, PenSquare, Library } from "lucide-react";

const tools = [
  {
    icon: Mail,
    title: "Email Marketing",
    description: "AI campaigns, contacts, segments, automations and analytics powered by Resend.",
    status: "Live",
    to: "/admin/marketing/email",
  },
  {
    icon: Library,
    title: "Prompt Library",
    description: "Create AI-optimized prompt posts with auto-generated featured images and SEO.",
    status: "Live",
    to: "/admin/marketing/prompt-library",
  },
  {
    icon: Share2,
    title: "Social Media Marketing",
    description: "Plan, generate and schedule posts across your social channels.",
    status: "Live",
    to: "/admin/marketing/social",
  },
  {
    icon: PenSquare,
    title: "Auto Blog",
    description: "AI-generated, SEO-optimized blog posts with scheduling, calendar, keywords and analytics.",
    status: "Live",
    to: "/admin/marketing/blog",
  },
];

export default function AdminMarketing() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader
        title="Marketing"
        description="Email, social and content marketing tools for your app."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map(({ to, ...tool }) => (
          <MarketingToolCard key={tool.title} {...tool} onClick={to ? () => navigate(to) : undefined} />
        ))}
      </div>
    </div>
  );
}