import React, { useState } from "react";
import { Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

// Admin: email every buyer of a product about an update ("lifetime updates" perk).
export default function NotifyBuyersDialog({ open, onOpenChange, product }) {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    setSending(true);
    const res = await base44.functions.invoke("notifyProductBuyers", {
      productId: product.id,
      updateNote: note.trim(),
    });
    setSending(false);
    if (res.data?.success) {
      toast.success(`Emailed ${res.data.sent} of ${res.data.totalBuyers} buyer${res.data.totalBuyers === 1 ? "" : "s"}`);
      setNote("");
      onOpenChange(false);
    } else {
      toast.error(res.data?.error || "Could not send update emails.");
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" /> Notify buyers of an update
          </DialogTitle>
          <DialogDescription>
            Emails everyone who bought <span className="text-foreground font-medium">{product.name}</span> about
            what's new. They'll be pointed to their dashboard for the latest download.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's new in this update? e.g. Added 3 new prompts covering webhook reconciliation…"
          rows={5}
        />
        <Button onClick={send} disabled={sending || !note.trim()} className="w-full font-semibold">
          {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : "Email all buyers"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}