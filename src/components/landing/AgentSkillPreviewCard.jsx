import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { trackCTA } from "@/lib/analytics";

const FEATURED_IMAGE = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/445de1ec7_generated_image.png";

export default function AgentSkillPreviewCard({ skill, featured = false }) {
  const onClick = () =>
    trackCTA({ text: skill.title, location: "home_agent_skills", destination: "/learn/agent-skills" });

  if (featured) {
    return (
      <Link
        to="/learn/agent-skills"
        onClick={onClick}
        className="group flex flex-col h-full overflow-hidden rounded-2xl border border-border bg-card/70 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={FEATURED_IMAGE}
            alt={skill.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        </div>
        <div className="flex flex-col flex-1 p-7">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-3">
            <Sparkles className="w-4 h-4" /> {skill.category || "Agent Skill"}
          </span>
          <h3 className="font-sora font-bold text-xl md:text-2xl mb-3 group-hover:text-primary transition-colors">
            {skill.title}
          </h3>
          {skill.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 mb-5">{skill.description}</p>
          )}
          <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
            View skill <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/learn/agent-skills"
      onClick={onClick}
      className="group flex items-start gap-4 rounded-2xl border border-border bg-card/70 p-5 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary group-hover:bg-primary/10 transition-colors">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        {skill.category && (
          <span className="block text-[11px] font-bold uppercase tracking-widest text-primary mb-1">{skill.category}</span>
        )}
        <span className="block font-sora font-bold text-base group-hover:text-primary transition-colors">
          {skill.title}
        </span>
        {skill.description && (
          <span className="block text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-1">{skill.description}</span>
        )}
      </span>
    </Link>
  );
}