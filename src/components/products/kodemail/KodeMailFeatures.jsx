import React from "react";
import { inboxFeatures } from "./kodeMailData";
import KodeMailFeatureCard from "./KodeMailFeatureCard";
import KodeMailSectionHeading from "./KodeMailSectionHeading";

export default function KodeMailFeatures() {
  return (
    <section className="py-16 sm:py-24">
      <KodeMailSectionHeading
        eyebrow="Included"
        title="What the prompts build for you"
        subtitle="Run the pack in order and you end up with a full inbox system — everything a paid mailbox gives you, hosted on your own domain and owned by you."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {inboxFeatures.map((f, i) => (
          <KodeMailFeatureCard key={f.label} feature={f} index={i} />
        ))}
      </div>
    </section>
  );
}