import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export default function OcoyaProfilePicker({ workspaceId, selected, onChange }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    base44.functions
      .invoke("ocoyaRequest", { action: "profiles", workspaceId })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.socialProfiles || [];
        setProfiles(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [workspaceId]);

  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading connected profiles...
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-3">
        No social profiles connected yet — connect one in the Settings tab.
      </p>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {profiles.map((p) => {
        const id = p.id;
        const name = p.name || p.username || p.displayName || "Profile";
        const network = p.provider || p.platform || p.network || "";
        return (
          <label
            key={id}
            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
              selected.includes(id) ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"
            }`}
          >
            <Checkbox checked={selected.includes(id)} onCheckedChange={() => toggle(id)} />
            {(p.avatarUrl || p.pictureUrl || p.avatar) && (
              <img src={p.avatarUrl || p.pictureUrl || p.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
            )}
            <span className="min-w-0">
              <span className="block text-sm font-medium truncate">{name}</span>
              {network && <span className="block text-xs text-muted-foreground capitalize">{network}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}