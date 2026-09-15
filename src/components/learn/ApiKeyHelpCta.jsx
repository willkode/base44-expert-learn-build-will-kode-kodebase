import React from "react";
import { LifeBuoy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export default function ApiKeyHelpCta() {
  return (
    <div className="mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <LifeBuoy className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="font-sora font-bold text-xl md:text-2xl tracking-tight">
            Need help making the switch?
          </h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            If the audit turns up legacy API keys and you'd rather not migrate them yourself, we'll
            handle the token migration, header updates and testing for you.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-5 font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] hover:opacity-90 text-white border-0"
            onClick={() =>
              trackEvent("click_migration_help_cta", {
                page_path: window.location.pathname,
                destination: "kodeagency.us",
              })
            }
          >
            <a href="https://kodeagency.us" target="_blank" rel="noopener noreferrer">
              Get migration help <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}