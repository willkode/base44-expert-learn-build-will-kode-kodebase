import React from "react";

// "500+ Apps Shipped" credibility strip with the AI build platforms used.
const PLATFORMS = ["Base44", "Lovable", "Bolt", "Replit", "Emergent"];

export default function HeroPlatforms() {
  return (
    <div>
      <h3 className="font-sora font-bold text-lg md:text-xl mb-3">
        <span className="text-gradient-orange">500+</span> Apps Shipped
      </h3>
      <div className="flex flex-wrap items-center gap-2">
        {PLATFORMS.map((name) => (
          <span
            key={name}
            className="px-3 py-1.5 rounded-lg border border-border bg-card/60 backdrop-blur-sm text-sm font-semibold text-foreground/80"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}