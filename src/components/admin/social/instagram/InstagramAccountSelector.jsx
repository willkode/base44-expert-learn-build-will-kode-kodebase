import React from "react";
import { Instagram, CheckCircle2, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";

// Picks which connected Instagram professional account publishes the post.
// `account` is the SocialAccount; available accounts come from Meta's connect flow.
export default function InstagramAccountSelector({ account, value, onChange }) {
  const available = (account && account.available_instagram_accounts) || [];
  // Fall back to the single connected account when no multi-account list exists.
  const options = available.length
    ? available
    : account?.instagram_business_account_id
      ? [{
          id: account.instagram_business_account_id,
          username: account.instagram_username || account.platform_username,
          profile_picture_url: account.instagram_profile_picture_url,
        }]
      : [];

  const selectedId = value || account?.selected_default_instagram_account_id || options[0]?.id || "";

  if (options.length === 0) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400 flex items-start gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        No Instagram professional account is available. Connect one through Meta first.
      </div>
    );
  }

  return (
    <div>
      <Label className="mb-1 block text-xs text-muted-foreground">Instagram account</Label>
      <div className="space-y-2">
        {options.map((opt) => {
          const active = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                active ? "border-primary/50 bg-primary/10" : "border-border hover:border-primary/30"
              }`}
            >
              {opt.profile_picture_url ? (
                <img src={opt.profile_picture_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">@{opt.username || "account"}</p>
                <p className="text-[11px] text-muted-foreground">Professional account</p>
              </div>
              {active && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}