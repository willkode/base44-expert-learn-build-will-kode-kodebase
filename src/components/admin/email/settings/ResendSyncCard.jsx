import React, { useState } from "react";
import { RefreshCw, Loader2, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResendSyncCard({ settings, set, onSaveAudience, sendingEnabled }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const audienceId = settings?.resendAudienceId || "";

  const handleSync = async () => {
    if (!audienceId.trim()) {
      toast.error("Enter and save a Resend Audience ID first");
      return;
    }
    setSyncing(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("syncResendContacts", {});
      if (res.data?.error) throw new Error(res.data.error);
      setResult(res.data);
      toast.success(
        `Imported from Resend — ${res.data.created} new, ${res.data.updated} updated`
      );
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="font-sora font-semibold">Sync Resend Contacts</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Import existing contacts from your Resend audience into the email marketing system. New
        contacts are added, and existing ones are linked so you can send to them.
      </p>

      <div className="space-y-2 mb-4">
        <Label htmlFor="resendAudienceId">Resend Audience ID</Label>
        <div className="flex gap-2">
          <Input
            id="resendAudienceId"
            placeholder="e.g. 78261eea-8f8b-4381-83c6-79fa7120f1cf"
            value={audienceId}
            onChange={(e) => set("resendAudienceId", e.target.value)}
          />
          {onSaveAudience && (
            <Button variant="outline" onClick={onSaveAudience} disabled={syncing}>
              Save
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Find this in your Resend dashboard under Audiences. Save it before syncing.
        </p>
      </div>

      <Button onClick={handleSync} disabled={syncing || !sendingEnabled}>
        {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
        {syncing ? "Importing..." : "Import contacts from Resend"}
      </Button>
      {!sendingEnabled && (
        <p className="text-xs text-muted-foreground mt-2">
          Configure your Resend API key and sender identity first.
        </p>
      )}

      {result && (
        <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3 text-sm">
          <span className="font-medium">{result.total}</span> contacts found —{" "}
          <span className="text-green-400">{result.created} created</span>,{" "}
          <span className="text-blue-400">{result.updated} updated</span>
          {result.skipped > 0 && <>, {result.skipped} skipped</>}.
        </div>
      )}
    </div>
  );
}