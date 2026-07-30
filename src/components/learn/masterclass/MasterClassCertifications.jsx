import React from "react";
import { Award } from "lucide-react";
import { CERTIFICATIONS } from "./masterClassData";

export default function MasterClassCertifications() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
      <h2 className="font-sora font-extrabold text-3xl tracking-tight text-center">
        Earn <span className="text-gradient-orange">KodeBase certificates</span> as you go
      </h2>
      <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
        Each phase you finish is a credential you can show clients and employers. These are
        professional certificates issued by KodeBase — not by Base44 or Anthropic.
      </p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CERTIFICATIONS.map((c) => (
          <div key={c.name} className="rounded-xl border border-border bg-card/50 p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <Award className="w-5 h-5" />
            </span>
            <h3 className="mt-4 font-sora font-semibold text-base leading-snug">{c.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">Requires {c.req}</p>
          </div>
        ))}
      </div>
    </section>
  );
}