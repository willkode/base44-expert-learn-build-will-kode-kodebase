import React from "react";
import { AreaField } from "./WizardField";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function Step3Features({ data, set }) {
  return (
    <div className="space-y-5">
      <AreaField label="Main features" required value={data.mainFeatures} onChange={(v) => set("mainFeatures", v)} placeholder="The core things users can do. e.g. post jobs, browse providers, book services" />
      <AreaField label="User dashboard features" value={data.userDashboardFeatures} onChange={(v) => set("userDashboardFeatures", v)} placeholder="What a logged-in user sees and manages." />
      <AreaField label="Admin features" value={data.adminFeatures} onChange={(v) => set("adminFeatures", v)} placeholder="What admins need to manage and moderate." />
      <AreaField label="Search / filtering needs" value={data.searchNeeds} onChange={(v) => set("searchNeeds", v)} placeholder="What do users search or filter by?" />
      <div className="flex items-center justify-between rounded-xl border border-border bg-card/40 px-4 py-3">
        <Label className="cursor-pointer">Messaging / notifications needed?</Label>
        <Switch checked={!!data.messagingNeeded} onCheckedChange={(v) => set("messagingNeeded", v)} />
      </div>
    </div>
  );
}