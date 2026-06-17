import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plug, RefreshCw, Unplug, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import StatusBadge from "@/components/admin/social/StatusBadge";
import { Button } from "@/components/ui/button";
import { PLATFORMS, CONNECTION_STATUS_STYLES, formatDateTime } from "@/components/admin/social/socialConfig";
import { trackEvent } from "@/lib/analytics";
import SocialAlertBanner from "@/components/admin/social/notifications/SocialAlertBanner";
import SocialSafetyWarnings from "@/components/admin/social/setup/SocialSafetyWarnings";

const REQUIRED_SCOPES = {
  twitter: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  reddit: ["identity", "submit", "read"],
  linkedin: ["w_member_social", "r_basicprofile"],
  facebook: ["pages_manage_posts", "pages_read_engagement", "business_management"],
  instagram: ["instagram_basic", "instagram_content_publish"],
};

export default function SocialConnections() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    trackEvent("admin_social_connections_view");
    base44.entities.SocialAccount.list("-created_date", 200).then((a) => {
      setAccounts(a);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState label="Loading connections..." />;

  const accountFor = (key) => accounts.find((a) => a.platform === key);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Connections"
        description="Connect your social accounts. Account tokens are stored securely on the backend and never shown here."
      />

      <SocialAlertBanner
        events={["account_token_expired", "facebook_token_expired", "instagram_token_expired", "account_disconnected", "facebook_page_disconnected", "instagram_account_disconnected"]}
        title="Connection alerts"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLATFORMS.map(({ key, label, icon: Icon }) => {
          const acc = accountFor(key);
          const status = acc?.connection_status || "disconnected";
          return (
            <div key={key} className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#f87171]/15 via-[#fb923c]/15 to-[#facc15]/15 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-sora font-semibold">{label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {acc?.platform_display_name || acc?.platform_username || "Not connected"}
                    </p>
                  </div>
                </div>
                <StatusBadge value={status} styleMap={CONNECTION_STATUS_STYLES} />
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Required permissions
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(REQUIRED_SCOPES[key] || []).map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{s}</span>
                  ))}
                </div>
              </div>

              {key === "facebook" && status !== "connected" && (
                <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-400 space-y-1">
                  <p>No Facebook Page connected yet. Connect a Page you manage to schedule and publish Page posts, links, images, videos, and campaign updates.</p>
                  <p className="text-amber-300/80">Facebook posting requires a connected Facebook Page and the correct Meta permissions. Personal profile posting is not supported by this workflow.</p>
                </div>
              )}

              {key === "instagram" && status !== "connected" && (
                <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-400 space-y-1">
                  <p>No Instagram account connected yet. Link an Instagram <span className="font-medium">Business or Creator</span> (professional) account to a Facebook Page you manage.</p>
                  <p className="text-amber-300/80">Instagram requires media — text-only posts are not supported. Publishing depends on Meta permissions and media format requirements.</p>
                </div>
              )}

              {acc?.last_connected_at && (
                <p className="text-xs text-muted-foreground mb-4">Last connected {formatDateTime(acc.last_connected_at)}</p>
              )}

              <div className="flex items-center gap-2">
                {status === "connected" ? (
                  <>
                    <Button variant="outline" size="sm" disabled title="OAuth comes next"><RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reconnect</Button>
                    <Button variant="outline" size="sm" disabled title="OAuth comes next"><Unplug className="w-3.5 h-3.5 mr-1.5" /> Disconnect</Button>
                  </>
                ) : (
                  <Button size="sm" disabled title="OAuth comes next"><Plug className="w-3.5 h-3.5 mr-1.5" /> Connect</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        OAuth connection flows are implemented in a later step. Each platform requires its own developer app and credentials.
      </p>

      <SocialSafetyWarnings />
    </div>
  );
}