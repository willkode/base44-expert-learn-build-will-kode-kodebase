import React from "react";
import { AreaField } from "./WizardField";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function Step4Data({ data, set }) {
  return (
    <div className="space-y-5">
      <AreaField label="What data needs to be stored?" required value={data.dataStored} onChange={(v) => set("dataStored", v)} placeholder="e.g. user profiles, listings, bookings, reviews, payments" />
      <AreaField label="Main user workflows" value={data.workflows} onChange={(v) => set("workflows", v)} placeholder="Step-by-step journeys. e.g. user posts job → provider applies → user accepts" />
      <AreaField label="Approval flows" value={data.approvalFlows} onChange={(v) => set("approvalFlows", v)} placeholder="Anything that needs review/approval before going live?" />
      <AreaField label="Status tracking needs" value={data.statusTracking} onChange={(v) => set("statusTracking", v)} placeholder="e.g. order statuses, application stages" />
      <div className="flex items-center justify-between rounded-xl border border-border bg-card/40 px-4 py-3">
        <Label className="cursor-pointer">Files / uploads needed?</Label>
        <Switch checked={!!data.filesNeeded} onCheckedChange={(v) => set("filesNeeded", v)} />
      </div>
    </div>
  );
}