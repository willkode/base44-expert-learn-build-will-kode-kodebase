import React from "react";
import { Info } from "lucide-react";

const STEPS = [
  "Create a Resend account at resend.com and add your sending domain.",
  "Add the DNS records Resend gives you (SPF + DKIM), then verify the domain.",
  "Create an API key in Resend and add it as the RESEND_API_KEY backend secret (Dashboard → Settings → Environment Variables).",
  "Set your from name and from email below using an address on your verified domain, then save.",
  "Click Test Connection, then send yourself a test email to confirm delivery.",
];

export default function SetupInstructions() {
  return (
    <div className="rounded-2xl border border-blue-500/25 bg-blue-500/5 p-6">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-blue-400" />
        <h3 className="font-sora font-semibold">Setup Instructions</h3>
      </div>
      <ol className="space-y-2 list-decimal list-inside">
        {STEPS.map((s, i) => (
          <li key={i} className="text-sm text-muted-foreground">{s}</li>
        ))}
      </ol>
    </div>
  );
}