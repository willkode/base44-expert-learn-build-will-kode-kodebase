import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plug, RefreshCw, Unplug, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import StatusBadge from "@/components/admin/social/StatusBadge";
import { Button } from "@/components/ui/button";
import { PLATFORMS, CONNECTION_STATUS_STYLES, formatDateTime } from "@/components/admin/social/socialConfig";
import { trackEvent } from "@/lib/analytics";

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
    </div>
  );
}