import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

export default function SendQuoteLinkDialog({ lead, onClose, onSent }) {
  const [amount, setAmount] = useState(lead?.quoteAmountCents ? String(lead.quoteAmountCents / 100) : "199");
  const [itemName, setItemName] = useState("Base44 App Migration — Custom Quote");
  const [message, setMessage] = useState(
    lead?.quoteMessage ||
      `Hi ${lead?.name || "there"},\n\nThanks for sending over your app details. Here's the quote to migrate your Base44 app off the platform, including the full build, testing, and handoff.\n\nUse the button below to pay and kick things off — you'll fill out a short intake form right after checkout.`
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    setError("");
    const cents = Math.round(parseFloat(amount) * 100);
    if (!Number.isFinite(cents) || cents < 100) {
      setError("Enter an amount of at least $1.");
      return;
    }
    setSending(true);
    const res = await base44.functions.invoke("migrationAdmin", {
      action: "send_quote_link",
      lead_id: lead.id,
      amount_cents: cents,
      item_name: itemName,
      message,
    }).catch((e) => ({ data: { error: e.response?.data?.error || "Could not send the payment link." } }));
    setSending(false);
    if (res.data?.success) {
      onSent();
      onClose();
    } else {
      setError(res.data?.error || "Could not send the payment link.");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send payment link to {lead?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{lead?.email}</p>
          <div className="space-y-2">
            <Label htmlFor="quote-amount">Amount (USD)</Label>
            <Input id="quote-amount" type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quote-item">Line item name</Label>
            <Input id="quote-item" value={itemName} onChange={(e) => setItemName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quote-note">Custom message</Label>
            <Textarea id="quote-note" rows={7} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={send} disabled={sending} className="w-full font-semibold">
            {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : <><Send className="w-4 h-4 mr-2" /> Create link & email quote</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}