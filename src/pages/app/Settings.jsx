import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import PlanUsageCard from "@/components/plan/PlanUsageCard";

export default function Settings() {
  const { user } = useOutletContext();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user?.id) {
      base44.entities.UserProfile.filter({ userId: user.id }, "-created_date", 1)
        .then((rows) => setProfile(rows[0] || { plan: user?.plan || "free" }));
    }
  }, [user?.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await base44.auth.updateMe({ full_name: fullName });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Manage your account and preferences." />

      {profile && <div className="mb-6"><PlanUsageCard profile={profile} /></div>}

      <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card/60 p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={fullName} onChange={(e) => { setFullName(e.target.value); setSaved(false); }} className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user?.email || ""} disabled className="h-11 opacity-60" />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Plan</Label>
            <div className="h-11 flex items-center px-3 rounded-md border border-border bg-secondary/40 text-sm capitalize">{user?.plan || "free"}</div>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <div className="h-11 flex items-center px-3 rounded-md border border-border bg-secondary/40 text-sm capitalize">{user?.role || "user"}</div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : saved ? <><Check className="w-4 h-4 mr-2" /> Saved</> : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}