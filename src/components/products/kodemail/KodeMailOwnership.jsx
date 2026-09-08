import React from "react";
import { Check, X } from "lucide-react";
import { KODEMAIL_PRICE } from "./kodeMailData";

const subscriptionCons = [
  "$6–$22 per user, every single month",
  "Costs multiply with every new address you add",
  "Price increases you have no control over",
  "Stop paying and you lose your business email",
  "Years of payments for the same simple inbox",
];

const ownPros = [
  "One payment for the full prompt pack — no monthly bill",
  "You build and own the inbox system yourself",
  "Create as many addresses as you want, at no extra cost",
  "Step-by-step Cloudflare routing instructions included",
  `Pays for itself in under a month at $${KODEMAIL_PRICE}`,
];

export default function KodeMailOwnership() {
  return (
    <section className="mb-16">
      <h2 className="font-sora font-bold text-3xl text-center mb-3">Rent your email, or own it</h2>
      <p className="text-muted-foreground text-center text-sm mb-8 max-w-xl mx-auto">
        A team of five on Google Workspace pays roughly $420 a year — every year. KodeMail is a one-time payment for
        the prompts and instructions to build the same professional email yourself.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border bg-card/40 p-6">
          <h3 className="font-sora font-semibold text-lg mb-4 text-muted-foreground">
            Google Workspace, Microsoft 365 &amp; co.
          </h3>
          <ul className="space-y-3">
            {subscriptionCons.map((c) => (
              <li key={c} className="flex items-start gap-3 text-sm text-muted-foreground">
                <X className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground/70" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <h3 className="font-sora font-semibold text-lg mb-4">
            <span className="text-gradient-orange">KodeMail — pay once, own it</span>
          </h3>
          <ul className="space-y-3">
            {ownPros.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm">
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}