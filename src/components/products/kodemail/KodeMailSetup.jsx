import React from "react";
import { Sparkles } from "lucide-react";
import { setupSteps } from "./kodeMailData";

export default function KodeMailSetup() {
  return (
    <section className="mb-16">
      <h2 className="font-sora font-bold text-3xl text-center mb-3">How it works</h2>
      <p className="text-muted-foreground text-center text-sm mb-8 max-w-xl mx-auto">
        Prompts in the right order, then a guided Cloudflare setup. No guessing at mail-server settings.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {setupSteps.map((step) => (
          <div key={step.num} className="p-5 rounded-xl border border-border bg-card/40">
            <span className="font-sora font-extrabold text-2xl text-gradient-orange">{step.num}</span>
            <p className="font-semibold mt-2">{step.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Includes an AI assistant prompt.</span> One of the prompts
          builds an in-app assistant for your inbox — it creates new addresses, checks your email configuration,
          diagnoses delivery problems, and repairs supported settings with your approval.
        </p>
      </div>
    </section>
  );
}