import React from "react";
import { TextField, AreaField } from "./WizardField";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function Toggle({ label, helper, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card/40 px-4 py-3">
      <div>
        <Label className="cursor-pointer">{label}</Label>
        {helper && <p className="text-xs text-muted-foreground mt-0.5">{helper}</p>}
      </div>
      <Switch checked={!!checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function Step2Users({ data, set }) {
  return (
    <div className="space-y-5">
      <AreaField label="Target users" required value={data.targetAudience} onChange={(v) => set("targetAudience", v)} placeholder="Who will use this app? e.g. homeowners and verified contractors" />
      <TextField label="User roles" value={data.userRoles} onChange={(v) => set("userRoles", v)} placeholder="e.g. Customer, Provider, Admin" helper="List the distinct roles separated by commas." />
      <Toggle label="Guest access needed?" helper="Can non-logged-in visitors use part of the app?" checked={data.guestAccess} onChange={(v) => set("guestAccess", v)} />
      <Toggle label="Admin dashboard needed?" checked={data.adminDashboard} onChange={(v) => set("adminDashboard", v)} />
      <Toggle label="Staff or team accounts needed?" helper="Multiple people managing under one account." checked={data.teamAccounts} onChange={(v) => set("teamAccounts", v)} />
    </div>
  );
}