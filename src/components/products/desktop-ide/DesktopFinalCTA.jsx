import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export default function DesktopFinalCTA({ onEarlyAccess }) {
  return (
    <section className="py-20 px-6 blueprint-grid">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mb-4">
          Everything you have built on Base44, <span className="text-gradient-orange">open on your own machine.</span>
        </h2>
        <p className="text-muted-foreground mb-8">
          The real editor, your code, a preview server, backend logs, ten AI audits, and the exits — with your Base44
          app left exactly as it is.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={() => { trackEvent("cta_get_lifetime", { location: "final_cta" }); document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }); }}
            className="font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90 glow-orange"
          >
            Get Lifetime Access — $25 <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => { trackEvent("cta_launch_list", { location: "final_cta" }); onEarlyAccess(); }}>
            Join the Launch List
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-10 max-w-2xl mx-auto">
          Base44 Desktop is an independent product and is not affiliated with, endorsed by, or operated by Base44 or Wix. Base44 and related names may be trademarks of their respective owners.
        </p>
      </div>
    </section>
  );
}