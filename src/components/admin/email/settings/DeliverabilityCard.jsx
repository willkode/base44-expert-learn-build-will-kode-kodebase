import React from "react";
import { Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const CHECKLIST = [
  ["domainVerified", "Domain verified"],
  ["spfConfigured", "SPF configured"],
  ["dkimConfigured", "DKIM configured"],
  ["dmarcConfigured", "DMARC configured"],
  ["trackingConfigured", "Tracking enabled"],
];

export default function DeliverabilityCard({ settings, set, domains }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-center gap-2 mb-1">
        <Globe className="w-4 h-4 text-primary" />
        <h3 className="font-sora font-semibold">Domain & Deliverability</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Verify your domain in Resend, then run Test Connection to pull live status — or track setup manually below.
      </p>
      <div className="mb-5">
        <Label className="mb-1.5 block text-sm">Sending domain</Label>
        <Input
          value={settings.resendDomain || ""}
          placeholder="yourdomain.com"
          onChange={(e) => set("resendDomain", e.target.value)}
        />
      </div>

      {domains && domains.length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Live status from Resend</p>
          {domains.map((d) => (
            <div key={d.name} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{d.name}</span>
                <Badge variant={d.status === "verified" ? "default" : "secondary"} className="capitalize">{d.status}</Badge>
              </div>
              {(d.records || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {d.records.map((r, i) => (
                    <Badge key={i} variant="outline" className="text-xs capitalize">
                      {r.record} {r.type}: {r.status || "unknown"}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Manual checklist</p>
      <div className="space-y-2">
        {CHECKLIST.map(([k, label]) => (
          <div key={k} className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="text-sm">{label}</Label>
            <Switch checked={!!settings[k]} onCheckedChange={(v) => set(k, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}