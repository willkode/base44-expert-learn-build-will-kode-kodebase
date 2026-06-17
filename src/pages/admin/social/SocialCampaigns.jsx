import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Megaphone, Plus, BarChart3, Pause, Play, Archive } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/admin/social/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PLATFORM_MAP, CAMPAIGN_STATUS_STYLES, prettyLabel, formatDateTime } from "@/components/admin/social/socialConfig";
import { trackEvent } from "@/lib/analytics";

export default function SocialCampaigns() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    trackEvent("admin_social_campaigns_view");
    base44.entities.SocialCampaign.list("-created_date", 200).then((c) => {
      setCampaigns(c);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState label="Loading campaigns..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Campaigns"
        description="Organize posts into goal-driven marketing campaigns."
        actions={<Button disabled title="Campaign creation comes next."><Plus className="w-4 h-4 mr-1.5" /> New Campaign</Button>}
      />

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Group your social posts under campaigns to track goals and performance. Campaign creation is wired up in the next step."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Platforms</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{prettyLabel(c.goal)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {(c.default_platforms || []).map((p) => {
                        const P = PLATFORM_MAP[p];
                        return P?.icon ? <P.icon key={p} className="w-4 h-4 text-muted-foreground" /> : null;
                      })}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge value={c.status} styleMap={CAMPAIGN_STATUS_STYLES} /></TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {c.start_date ? formatDateTime(c.start_date) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" disabled title="Analytics"><BarChart3 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" disabled title={c.status === "paused" ? "Resume" : "Pause"}>
                        {c.status === "paused" ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" disabled title="Archive"><Archive className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}