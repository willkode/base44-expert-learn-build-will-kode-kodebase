import React from "react";
import { TextField, AreaField } from "./WizardField";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const APP_TYPES = ["SaaS", "Marketplace", "Internal tool", "CRM", "Directory", "Booking platform", "AI tool", "Client portal", "Other"];

export default function Step1Basics({ data, set }) {
  return (
    <div className="space-y-5">
      <TextField label="App name" required value={data.appName} onChange={(v) => set("appName", v)} placeholder="e.g. ContractorHub" helper="A short, memorable name for your app." />
      <AreaField label="Short description" required value={data.shortDescription} onChange={(v) => set("shortDescription", v)} placeholder="In one or two sentences, what does your app do?" />
      <TextField label="App URL" value={data.appUrl} onChange={(v) => set("appUrl", v)} placeholder="e.g. https://myapp.com" helper="Where your app lives. We'll use it when you share your launch with the community." />
      <div className="space-y-1.5">
        <Label>App type <span className="text-primary">*</span></Label>
        <Select value={data.appType} onValueChange={(v) => set("appType", v)}>
          <SelectTrigger className="h-11"><SelectValue placeholder="Select an app type" /></SelectTrigger>
          <SelectContent>
            {APP_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">This helps the architect choose the right structure.</p>
      </div>
    </div>
  );
}