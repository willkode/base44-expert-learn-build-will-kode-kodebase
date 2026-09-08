import React from "react";
import { inboxFeatures } from "./kodeMailData";
import KodeMailFeatureCard from "./KodeMailFeatureCard";

export default function KodeMailFeatures() {
  return (
    <section className="mb-16">
      <h2 className="font-sora font-bold text-3xl text-center mb-3">What the prompts build for you</h2>
      <p className="text-muted-foreground text-center text-sm mb-8 max-w-xl mx-auto">
        Run the pack in order and you end up with a full inbox system — everything a paid mailbox gives you, hosted
        on your own domain and owned by you.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {inboxFeatures.map((f) => (
          <KodeMailFeatureCard key={f.label} feature={f} />
        ))}
      </div>
    </section>
  );
}