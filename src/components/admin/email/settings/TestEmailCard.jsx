import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function TestEmailCard({ sendingEnabled, onSent }) {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("Test email from KodeBlueprint");
  const [body, setBody] = useState("This is a test email to verify your Resend configuration.");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await base44.functions.invoke("sendTestEmail", {
        recipient_email: recipient.trim(),
        subject,
        html_content: `<p>${body.replace(/\n/g, "<br/>")}</p>`,
        text_content: body,
      });
      if (res.data?.error || res.data?.success === false) throw new Error(res.data.error);
      toast.success(`Test email sent to ${recipient.trim()}`);
      if (onSent) onSent();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Test send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-center gap-2 mb-1">
        <Send className="w-4 h-4 text-primary" />
        <h3 className="font-sora font-semibold">Send Test Email</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        {sendingEnabled
          ? "Send yourself a test to verify everything works end to end."
          : "Disabled — configure the API key and from email first."}
      </p>
      <div className="space-y-4">
        <div>
          <Label className="mb-1.5 block text-sm">Recipient email</Label>
          <Input value={recipient} placeholder="you@example.com" onChange={(e) => setRecipient(e.target.value)} disabled={!sendingEnabled} />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} disabled={!sendingEnabled} />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">Message</Label>
          <Textarea value={body} rows={3} onChange={(e) => setBody(e.target.value)} disabled={!sendingEnabled} />
        </div>
        <Button onClick={handleSend} disabled={!sendingEnabled || sending || !recipient.trim() || !subject}>
          {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Send Test Email
        </Button>
      </div>
    </div>
  );
}