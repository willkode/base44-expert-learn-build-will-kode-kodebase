import React from "react";
import { AreaField } from "./WizardField";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card/40 px-4 py-3">
      <Label className="cursor-pointer">{label}</Label>
      <Switch checked={!!checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function Step6Security({ data, set }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Security level <span className="text-primary">*</span></Label>
        <Select value={data.securityLevel || "standard"} onValueChange={(v) => set("securityLevel", v)}>
          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="strict">Strict</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Strict adds tighter access rules and validation throughout.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Toggle label="Sensitive data stored?" checked={data.sensitiveData} onChange={(v) => set("sensitiveData", v)} />
        <Toggle label="Payment or financial data?" checked={data.financialData} onChange={(v) => set("financialData", v)} />
        <Toggle label="Multi-tenant data?" checked={data.multiTenant} onChange={(v) => set("multiTenant", v)} />
      </div>
      <AreaField label="Launch goal" value={data.launchGoal} onChange={(v) => set("launchGoal", v)} placeholder="When and how do you plan to launch? e.g. MVP in 4 weeks" />
      <AreaField label="Extra notes" value={data.notes} onChange={(v) => set("notes", v)} placeholder="Anything else the architect should know." />
    </div>
  );
}