import React from "react";
import { Check } from "lucide-react";
import { inboxFeatures } from "./kodeMailData";

export default function KodeMailFeatures() {
  return (
    <section className="mb-16">
      <h2 className="font-sora font-bold text-3xl text-center mb-3">Everything you need in one inbox</h2>
      <p className="text-muted-foreground text-center text-sm mb-8 max-w-xl mx-auto">
        A clean, modern inbox where you send, receive, organize, and respond — from an address that carries your
        own domain.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {inboxFeatures.map((f) => (
          <div key={f} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/40">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span className="text-sm">{f}</span>
          </div>
        ))}
      </div>
    </section>
  );
}