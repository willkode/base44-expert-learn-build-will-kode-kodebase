import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Megaphone, Plus, Eye, Pencil, Archive, Play } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/admin/social/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PLATFORM_MAP, CAMPAIGN_STATUS_STYLES, formatDateTime } from "@/components/admin/social/socialConfig";
import { GOAL_LABELS } from "@/components/admin/social/campaign/campaignConfig";
import { prettyLabel } from "@/components/admin/social/socialConfig";
import CampaignFormDialog from "@/components/admin/social/campaign/CampaignFormDialog";
import { trackEvent } from "@/lib/analytics";

export default function SocialCampaigns() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    base44.entities.SocialCampaign.list("-created_date", 200).then((c) => {
      setCampaigns(c);
      setLoading(false);
    });
  };

  useEffect(() => {
    trackEvent("admin_social_campaigns_view");
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setDialogOpen(true);
  };

  const setStatus = async (c, status) => {
    await base44.entities.SocialCampaign.update(c.id, { status });
    trackEvent("admin_social_campaign_status_changed", { status });
    toast.success(`Campaign ${status === "archived" ? "archived" : "reactivated"}.`);
    load();
  };

  if (loading) return <LoadingState label="Loading campaigns..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Campaigns"
        description="Organize posts into goal-driven marketing campaigns."
        actions={<Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> New Campaign</Button>}
      />

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Group your social posts under campaigns to track goals and performance. Create your first campaign to get started."
          actionLabel="New Campaign"
          onAction={openNew}
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
                <TableRow key={c.id} className="cursor-pointer" onClick={() => navigate(`/admin/marketing/social/campaigns/${c.id}`)}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{GOAL_LABELS[c.goal] || prettyLabel(c.goal)}</TableCell>
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
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" title="View" onClick={() => navigate(`/admin/marketing/social/campaigns/${c.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(c)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {c.status === "archived" ? (
                        <Button variant="ghost" size="icon" title="Reactivate" onClick={() => setStatus(c, "active")}>
                          <Play className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" title="Archive" onClick={() => setStatus(c, "archived")}>
                          <Archive className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CampaignFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaign={editing}
        onSaved={() => load()}
      />
    </div>
  );
}