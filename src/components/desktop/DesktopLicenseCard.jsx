import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Copy, Check, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const STATUS = {
  active: { label: "Active", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  expired: { label: "Subscription expired", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  inactive: { label: "No active plan", className: "bg-secondary text-muted-foreground border-border" },
  revoked: { label: "Revoked", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

const PLAN_LABEL = { lifetime: "Lifetime", monthly: "Monthly", admin: "Admin", none: "—" };

export default function DesktopLicenseCard() {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    base44.functions
      .invoke("desktopLicense", { action: "get" })
      .then((res) => { if (active) setLicense(res.data); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const copy = () => {
    // Clipboard access can be blocked by the browser — the key stays visible either way.
    navigator.clipboard?.writeText(license.licenseKey).catch(() => {});
    setCopied(true);
    trackEvent("desktop_license_key_copied", { plan: license.plan || "none", status: license.status });
    setTimeout(() => setCopied(false), 2000);
  };

  const status = STATUS[license?.status] || STATUS.inactive;

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6 md:p-8 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-sora text-lg font-bold flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" /> Desktop IDE account key
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Paste this key into Base44 Desktop IDE to activate it on your machine.
          </p>
        </div>
        {!loading && <Badge variant="outline" className={status.className}>{status.label}</Badge>}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading your key...
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <code className="flex-1 rounded-md border border-border bg-secondary/40 px-4 py-3 font-mono text-sm tracking-wider break-all">
              {license?.licenseKey}
            </code>
            <Button onClick={copy} variant="outline" className="sm:w-32">
              {copied ? <><Check className="w-4 h-4 mr-2" /> Copied</> : <><Copy className="w-4 h-4 mr-2" /> Copy</>}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Plan</div>
              <div className="font-semibold">{PLAN_LABEL[license?.plan] || "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Renews / expires</div>
              <div className="font-semibold">
                {license?.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : license?.plan === "lifetime" ? "Never" : "—"}
              </div>
            </div>
          </div>

          {license?.status !== "active" && (
            <p className="text-sm text-muted-foreground">
              Your key stays the same — it activates automatically once your lifetime purchase or
              monthly subscription is active.
            </p>
          )}
        </>
      )}
    </div>
  );
}