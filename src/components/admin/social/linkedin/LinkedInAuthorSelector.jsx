import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { User, Building2, CheckCircle2, Star, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Lets the admin choose to post as their personal profile or an available company page.
export default function LinkedInAuthorSelector({ linkedin, onChange, account }) {
  const [savingDefault, setSavingDefault] = useState(false);
  const set = (patch) => onChange({ ...linkedin, ...patch });

  const canPerson = !!account?.can_post_as_person && !!account?.linkedin_person_urn;
  const orgs = account?.available_organizations || [];
  const canOrg = !!account?.can_post_as_organization && orgs.length > 0;

  const selectPerson = () => {
    set({
      author_type: "person",
      author_urn: account?.linkedin_person_urn || "",
      organization_role_confirmed: false,
    });
  };

  const selectOrg = (org) => {
    set({
      author_type: "organization",
      author_urn: org.urn,
      organization_role_confirmed: false,
    });
  };

  const saveDefault = async () => {
    if (!account?.id || !linkedin.author_urn) return;
    setSavingDefault(true);
    try {
      await base44.entities.SocialAccount.update(account.id, {
        selected_default_author_urn: linkedin.author_urn,
      });
      toast.success("Default LinkedIn author saved.");
    } catch (e) {
      toast.error(e.message || "Could not save default.");
    }
    setSavingDefault(false);
  };

  const isPersonSelected = linkedin.author_type === "person";

  return (
    <div className="space-y-3">
      <Label className="text-xs text-muted-foreground">Post as</Label>

      {/* Personal profile */}
      <button
        type="button"
        onClick={canPerson ? selectPerson : undefined}
        disabled={!canPerson}
        className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
          isPersonSelected
            ? "border-primary/50 bg-primary/10"
            : "border-border hover:border-primary/30"
        } ${!canPerson ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
          {account?.platform_avatar_url ? (
            <img src={account.platform_avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{account?.platform_display_name || "Personal profile"}</p>
          <p className="text-[11px] text-muted-foreground">
            {canPerson ? "Posts to your personal feed" : "Personal posting not permitted"}
          </p>
        </div>
        {isPersonSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
      </button>

      {/* Organizations / pages */}
      {orgs.length > 0 && (
        <div className="space-y-2">
          <Label className="text-[11px] text-muted-foreground">Company pages</Label>
          {orgs.map((org) => {
            const selected = linkedin.author_type === "organization" && linkedin.author_urn === org.urn;
            return (
              <button
                key={org.urn}
                type="button"
                onClick={canOrg ? () => selectOrg(org) : undefined}
                disabled={!canOrg}
                className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  selected ? "border-primary/50 bg-primary/10" : "border-border hover:border-primary/30"
                } ${!canOrg ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
                  {org.logo_url ? (
                    <img src={org.logo_url} alt="" className="w-8 h-8 rounded-md object-cover" />
                  ) : (
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{org.name || "Organization"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{org.role || "Page"}</p>
                </div>
                {selected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {!canPerson && !canOrg && (
        <p className="text-xs text-amber-400">
          No LinkedIn posting permissions found on this account. Reconnect LinkedIn with publishing scopes.
        </p>
      )}

      {/* Confirm org role before page posting */}
      {linkedin.author_type === "organization" && linkedin.author_urn && (
        <label className="flex items-start gap-2 rounded-lg border border-border px-3 py-2 text-xs">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={!!linkedin.organization_role_confirmed}
            onChange={(e) => set({ organization_role_confirmed: e.target.checked })}
          />
          <span>
            I confirm I have an administrator / content poster role on this page and permission to publish on its behalf.
          </span>
        </label>
      )}

      {linkedin.author_urn && account?.id && (
        <Button variant="ghost" size="sm" onClick={saveDefault} disabled={savingDefault} className="text-xs">
          {savingDefault ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Star className="w-3.5 h-3.5 mr-1" />}
          Save as default author
        </Button>
      )}
    </div>
  );
}