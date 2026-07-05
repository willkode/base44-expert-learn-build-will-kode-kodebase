import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";

const PROVIDERS = ["facebook", "instagram", "x", "linkedin", "pinterest"];

export default function OcoyaSettings({ workspaceId, workspaces, onWorkspaceChange }) {
  const [me, setMe] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);

  useEffect(() => {
    base44.functions.invoke("ocoyaRequest", { action: "me" }).then((res) => {
      if (!res.data?.error) setMe(res.data);
    });
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    base44.functions.invoke("ocoyaRequest", { action: "profiles", workspaceId }).then((res) => {
      const list = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.socialProfiles || [];
      setProfiles(list);
      setLoading(false);
    });
  }, [workspaceId]);

  const handleConnect = async (provider) => {
    setConnecting(provider);
    const res = await base44.functions.invoke("ocoyaRequest", { action: "connectUrl", workspaceId, provider });
    setConnecting(null);
    if (res.data?.url) window.open(res.data.url, "_blank");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-2">
        <h3 className="font-sora font-semibold">Ocoya connection</h3>
        {me ? (
          <p className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Connected as {me.name || me.email || "Ocoya user"}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Checking connection...</p>
        )}
      </div>

      {workspaces.length > 1 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
          <Label>Active workspace</Label>
          <Select value={workspaceId} onValueChange={onWorkspaceChange}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workspaces.map((w) => (
                <SelectItem key={w.id} value={w.id}>{w.name || w.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-sora font-semibold">Connected social profiles</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading profiles...
          </div>
        ) : profiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No profiles connected yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {profiles.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                {(p.avatarUrl || p.pictureUrl || p.avatar) && (
                  <img src={p.avatarUrl || p.pictureUrl || p.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name || p.username || p.displayName || "Profile"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{p.provider || p.platform || p.network || ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Connect a new profile (opens Ocoya — you must be signed in there):
          </p>
          <div className="flex flex-wrap gap-2">
            {PROVIDERS.map((prov) => (
              <Button key={prov} variant="outline" size="sm" onClick={() => handleConnect(prov)} disabled={connecting === prov}>
                {connecting === prov ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5 mr-1.5" />}
                <span className="capitalize">{prov}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}