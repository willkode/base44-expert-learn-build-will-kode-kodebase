import React from "react";
import { Check } from "lucide-react";

export default function PorterList({ title, subtitle, items, icon: Icon = Check }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="font-sora text-3xl font-bold">{title}</h2>
      {subtitle && <p className="mt-2 text-muted-foreground max-w-3xl">{subtitle}</p>}
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((text) => (
          <li key={text} className="flex gap-3 rounded-2xl border border-border bg-card p-5">
            <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground leading-relaxed">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}