import React from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, BadgeCheck } from "lucide-react";

export default function LaunchAuditBanner({ onOrder }) {
  return (
    <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/15 to-card/60 p-6 glow-orange">
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="flex-1">
          <p className="text-sm text-primary font-semibold mb-3">Congratulations! Your application is complete and ready for launch.</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-sora font-bold text-lg">Order a Launch Ready Audit</h3>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Have our team of experienced developers, architects, engineers and security
            experts ensure your Base44 application is 100% ready for launch.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1.5 text-foreground">
              <BadgeCheck className="w-4 h-4 text-primary" />
              One time fee <strong>$75 USD</strong>
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              Completed within 24 hrs
            </span>
          </div>
        </div>
        <Button
          onClick={onOrder}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 px-6 shrink-0"
        >
          Order Audit — $75
        </Button>
      </div>
    </div>
  );
}