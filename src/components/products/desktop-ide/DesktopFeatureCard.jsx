import React from "react";

export default function DesktopFeatureCard({ image, alt, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-border bg-card/60 overflow-hidden ${className}`}>
      {image && (
        <img src={image} alt={alt} loading="lazy" className="w-full aspect-[16/9] object-cover border-b border-border" />
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}