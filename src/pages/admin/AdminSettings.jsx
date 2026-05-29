import React from "react";
import { Cog } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

export default function AdminSettings() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="System Settings" description="Platform-wide configuration." />
      <div className="rounded-2xl border border-border bg-card/60 p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Cog className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-sora font-semibold mb-1">General configuration</h3>
            <p className="text-sm text-muted-foreground">System settings such as AI model defaults, rate limits, and feature flags will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}