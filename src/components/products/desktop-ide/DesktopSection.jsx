import React from "react";

// Shared section wrapper — eyebrow + headline + optional supporting copy.
export default function DesktopSection({ id, eyebrow, headline, copy, children, className = "" }) {
  return (
    <section id={id} className={`py-16 md:py-24 px-6 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          {eyebrow && (
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">{eyebrow}</span>
          )}
          {headline && (
            <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-3 mb-4">{headline}</h2>
          )}
          {copy && <p className="text-muted-foreground text-lg">{copy}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}