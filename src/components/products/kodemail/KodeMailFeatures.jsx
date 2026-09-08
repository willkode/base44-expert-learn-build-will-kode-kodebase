import React from "react";
import { inboxFeatures } from "./kodeMailData";
import KodeMailFeatureCard from "./KodeMailFeatureCard";
import KodeMailSectionHeading from "./KodeMailSectionHeading";

export default function KodeMailFeatures() {
  return (
    <section className="py-16 sm:py-24">
      <KodeMailSectionHeading
        eyebrow="What you end up with"
        title="Everything a paid mailbox gives you — without the monthly bill"
        subtitle="Run the prompts in order and you finish with a real, working inbox on your own domain. Not a toy, not a demo — the email system you run your business from."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {inboxFeatures.map((f, i) => (
          <KodeMailFeatureCard key={f.label} feature={f} index={i} />
        ))}
      </div>
    </section>
  );
}