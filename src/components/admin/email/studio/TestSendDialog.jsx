import React, { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestSendDialog({ open, onOpenChange, draft }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    const res = await base44.functions.invoke("sendTestEmail", {
      recipient_email: email.trim(),
      subject: draft.subject,
      html_content: draft.htmlContent,
      text_content: draft.textContent,
    });
    setSending(false);
    if (res.data?.error || res.data?.success === false) {
      toast.error(res.data.error || "Test send failed.");
      return;
    }
    base44.analytics.track({ eventName: "email_studio_test_sent", properties: { has_html: !!draft.htmlContent } });
    toast.success(`Test email sent to ${email.trim()}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send a test email</DialogTitle>
          <DialogDescription>
            Sends this email (prefixed with [TEST]) to one address using your Resend setup.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label>Recipient email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={sending || !email.trim() || !draft.subject} onClick={handleSend}>
            {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : <><Send className="w-4 h-4 mr-2" /> Send test</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}