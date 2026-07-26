import React from "react";

export default function PorterCardGrid({ title, subtitle, items, columns = 3 }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="font-sora text-3xl font-bold">{title}</h2>
      {subtitle && <p className="mt-2 text-muted-foreground max-w-3xl">{subtitle}</p>}
      <div
        className={`mt-8 grid gap-5 ${
          columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors"
          >
            {item.image && (
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="w-full h-40 object-cover border-b border-border"
              />
            )}
            <div className="p-6">
            <h3 className="font-sora font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}