import React from "react";

// Framed product screenshot with an optional caption.
export default function DesktopShot({ src, alt, caption, className = "" }) {
  return (
    <figure className={className}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full rounded-2xl border border-border bg-[#0a0f1e] glow-orange"
      />
      {caption && (
        <figcaption className="text-sm text-muted-foreground mt-4 text-center max-w-2xl mx-auto">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}