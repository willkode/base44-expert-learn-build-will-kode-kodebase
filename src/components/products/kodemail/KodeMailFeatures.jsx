import React from "react";
import { inboxFeatures } from "./kodeMailData";
import KodeMailFeatureCard from "./KodeMailFeatureCard";

export default function KodeMailFeatures() {
  return (
    <section className="mb-16">
      <h2 className="font-sora font-bold text-3xl text-center mb-3">Everything a paid mailbox gives you</h2>
      <p className="text-muted-foreground text-center text-sm mb-8 max-w-xl mx-auto">
        The same professional inbox you'd rent monthly — send, receive, organize and respond from your own domain —
        except you own it outright.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {inboxFeatures.map((f) => (
          <KodeMailFeatureCard key={f.label} feature={f} />
        ))}
      </div>
    </section>
  );
}