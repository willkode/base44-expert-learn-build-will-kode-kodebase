import { ShieldCheck, Scale, XCircle } from "lucide-react";
import PlannerSection from "./PlannerSection";
import { trustItems, legalityExclusions } from "./plannerData";

export default function PlannerTrust() {
  return (
    <PlannerSection title="Your Repository Stays Yours">
      <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center gap-2 mb-4 text-primary"><ShieldCheck className="w-5 h-5" /><h3 className="font-sora font-semibold text-foreground">Read-only, authorized access</h3></div>
          <ul className="space-y-2">
            {trustItems.map((item) => (
              <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />{item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center gap-2 mb-4 text-primary"><Scale className="w-5 h-5" /><h3 className="font-sora font-semibold text-foreground">Is migrating a Base44 app allowed?</h3></div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Base44's Terms of Service state that, subject to Base44's ownership rights described in the terms, customers own the rights they hold under applicable law in the code and applications generated through the platform. Base44 also provides GitHub integration and local-development documentation for exported application code.
          </p>
          <p className="text-sm text-muted-foreground mb-3">This tool is intended only for repositories and applications that you own or are authorized to manage. It does not involve:</p>
          <ul className="space-y-1.5 mb-3">
            {legalityExclusions.map((item) => (
              <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />{item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">You should always review the current Base44 Terms of Service and obtain legal advice when necessary.</p>
        </div>
      </div>
    </PlannerSection>
  );
}