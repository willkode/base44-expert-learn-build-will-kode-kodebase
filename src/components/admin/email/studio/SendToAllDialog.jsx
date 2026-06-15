import React, { useState } from "react";
import { Loader2, Users, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SendToAllDialog({ open, onOpenChange, draft, campaignId }) {
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    const res = await base44.functions.invoke("sendCampaignToAllContacts", {
      subject: draft.subject,
      html_content: draft.htmlContent,
      text_content: draft.textContent,
      campaign_id: campaignId || undefined,
    });
    setSending(false);
    if (res.data?.error) {
      toast.error(res.data.error);
      return;
    }
    base44.analytics.track({
      eventName: "email_studio_broadcast_sent",
      properties: { sent: res.data.sent, total: res.data.total },
    });
    const { sent, total, failed } = res.data;
    toast.success(`Sent to ${sent}/${total} contacts${failed ? ` (${failed} failed)` : ""}.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Send to all contacts
          </DialogTitle>
          <DialogDescription>
            This sends "{draft.subject || "this email"}" to every subscribed contact. This action can't be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-2.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-200">
            Make sure you've previewed and tested the email first. Sending may take a moment for large lists.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
            Send to all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}