import React from "react";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const FIELDS = [
  ["resendFromName", "From name", "KodeBlueprint"],
  ["resendFromEmail", "From email", "hello@yourdomain.com"],
  ["resendReplyToEmail", "Reply-to email", "support@yourdomain.com"],
  ["companyName", "Company name", ""],
];

export default function SenderIdentityCard({ settings, set }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <h3 className="font-sora font-semibold mb-1">Default Sender</h3>
      <p className="text-sm text-muted-foreground mb-5">Identity used on all outgoing marketing emails.</p>
      {!settings.resendFromEmail && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 mb-5">
          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-200">
            No from email configured — sending is disabled until you set one. Use an address on your verified Resend domain.
          </p>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {FIELDS.map(([k, label, ph]) => (
          <div key={k}>
            <Label className="mb-1.5 block text-sm">{label}</Label>
            <Input value={settings[k] || ""} placeholder={ph} onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Label className="mb-1.5 block text-sm">Company mailing address</Label>
        <Input
          value={settings.companyAddress || ""}
          placeholder="123 Main St, Suite 100, Austin, TX 78701"
          onChange={(e) => set("companyAddress", e.target.value)}
        />
      </div>
      <div className="mt-4">
        <Label className="mb-1.5 block text-sm">Default footer text</Label>
        <Textarea
          value={settings.defaultFooterText || ""}
          placeholder="You're receiving this email because you signed up at..."
          rows={3}
          onChange={(e) => set("defaultFooterText", e.target.value)}
        />
      </div>
    </div>
  );
}