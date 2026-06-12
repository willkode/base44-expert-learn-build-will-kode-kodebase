import React from "react";
import { Plug, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function StatusRow({ label, ok, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      {value !== undefined ? (
        <span className="text-sm">{value || "—"}</span>
      ) : (
        <Badge variant={ok ? "default" : "secondary"}>{ok ? "Yes" : "No"}</Badge>
      )}
    </div>
  );
}

export default function ConnectionStatusCard({ status, onTestConnection, testing }) {
  const fmt = (d) => (d ? new Date(d).toLocaleString() : "—");
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Plug className="w-4 h-4 text-primary" />
          <h3 className="font-sora font-semibold">Connection Status</h3>
        </div>
        <Button variant="outline" size="sm" onClick={onTestConnection} disabled={testing || !status?.apiKeyConfigured}>
          {testing && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
          Test Connection
        </Button>
      </div>
      <StatusRow label="Resend API key configured" ok={!!status?.apiKeyConfigured} />
      <StatusRow label="Sending enabled" ok={!!status?.sendingEnabled} />
      <StatusRow label="Webhook configured" ok={!!status?.webhookConfigured} />
      <StatusRow label="Last successful send" value={fmt(status?.lastSuccessfulSendAt)} />
      <StatusRow label="Last webhook received" value={fmt(status?.lastWebhookReceivedAt)} />
      <StatusRow label="Last error" value={status?.lastError || "None"} />
      <p className="text-xs text-muted-foreground mt-4">
        The API key is stored as a backend secret and is never displayed here. To update it, change the
        RESEND_API_KEY secret in the app dashboard.
      </p>
    </div>
  );
}