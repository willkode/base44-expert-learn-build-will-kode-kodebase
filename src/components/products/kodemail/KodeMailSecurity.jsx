import React from "react";
import { ShieldCheck, Users } from "lucide-react";
import { securityPoints, builtFor } from "./kodeMailData";

export default function KodeMailSecurity() {
  return (
    <section className="grid lg:grid-cols-2 gap-6 mb-16">
      <div className="rounded-2xl border border-border bg-card/40 p-7">
        <ShieldCheck className="w-7 h-7 text-primary mb-4" />
        <h2 className="font-sora font-bold text-2xl mb-4">Secure by design</h2>
        <div className="space-y-3">
          {securityPoints.map((p) => (
            <p key={p} className="text-sm text-muted-foreground">• {p}</p>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card/40 p-7">
        <Users className="w-7 h-7 text-primary mb-4" />
        <h2 className="font-sora font-bold text-2xl mb-3">Built for modern businesses</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Anyone who wants professional email they own instead of rent.
        </p>
        <div className="flex flex-wrap gap-2">
          {builtFor.map((b) => (
            <span key={b} className="px-3 py-1.5 rounded-full border border-border bg-background/40 text-xs font-medium">
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}