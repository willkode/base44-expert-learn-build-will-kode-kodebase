import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

export default function NewProject() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    idea: "",
    app_type: "",
    target_users: "",
    platform: "base44",
    security_level: "standard",
    monetization: "",
    launch_timeline: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const project = await base44.entities.Project.create({ ...form, status: "draft" });
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="New Project" description="Describe your app idea — the AI architect will plan the rest." />

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card/60 p-6 md:p-8">
        <div className="space-y-2">
          <Label htmlFor="name">App name *</Label>
          <Input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Contractor Marketplace" className="h-11" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idea">App idea</Label>
          <Textarea id="idea" value={form.idea} onChange={(e) => set("idea", e.target.value)} placeholder="I want to build a marketplace that connects homeowners with verified contractors..." className="min-h-28" />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="app_type">App type</Label>
            <Input id="app_type" value={form.app_type} onChange={(e) => set("app_type", e.target.value)} placeholder="Marketplace, SaaS, CRM..." className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_users">Target users</Label>
            <Input id="target_users" value={form.target_users} onChange={(e) => set("target_users", e.target.value)} placeholder="Homeowners, contractors..." className="h-11" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={form.platform} onValueChange={(v) => set("platform", v)}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="base44">Base44</SelectItem>
                <SelectItem value="supabase">Supabase</SelectItem>
                <SelectItem value="firebase">Firebase</SelectItem>
                <SelectItem value="bubble">Bubble</SelectItem>
                <SelectItem value="lovable">Lovable</SelectItem>
                <SelectItem value="bolt">Bolt</SelectItem>
                <SelectItem value="replit">Replit</SelectItem>
                <SelectItem value="custom_react">Custom React</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Security level</Label>
            <Select value={form.security_level} onValueChange={(v) => set("security_level", v)}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="monetization">Monetization</Label>
            <Input id="monetization" value={form.monetization} onChange={(e) => set("monetization", e.target.value)} placeholder="Subscriptions, commission..." className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="launch_timeline">Launch timeline</Label>
            <Input id="launch_timeline" value={form.launch_timeline} onChange={(e) => set("launch_timeline", e.target.value)} placeholder="4 weeks, Q3..." className="h-11" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate("/projects")}>Cancel</Button>
          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Create Project</>}
          </Button>
        </div>
      </form>
    </div>
  );
}