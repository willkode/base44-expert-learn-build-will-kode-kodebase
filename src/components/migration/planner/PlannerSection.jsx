// Shared section shell: eyebrow + heading + optional intro, centered.
export default function PlannerSection({ eyebrow, title, intro, children, className = "" }) {
  return (
    <section className={className}>
      <div className="text-center max-w-3xl mx-auto mb-10">
        {eyebrow && <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">{eyebrow}</p>}
        <h2 className="font-sora text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        {intro && <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{intro}</p>}
      </div>
      {children}
    </section>
  );
}