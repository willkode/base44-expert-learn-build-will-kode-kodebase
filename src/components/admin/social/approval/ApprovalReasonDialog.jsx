import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ApprovalReasonDialog({ open, onOpenChange, mode, onConfirm, submitting }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const isReject = mode === "reject";
  const title = isReject ? "Reject post" : "Request revision";
  const description = isReject
    ? "Explain why this post is being rejected. It won't be schedulable until revised."
    : "Add notes for what should change. The post moves to “revision requested”.";
  const label = isReject ? "Rejection reason" : "Revision notes";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Label className="mb-1.5 block">{label}</Label>
          <Textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={isReject ? "e.g. Off-brand tone, claim can't be substantiated..." : "e.g. Shorten the hook, add a clearer CTA..."}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button
            variant={isReject ? "destructive" : "default"}
            onClick={() => onConfirm(reason)}
            disabled={submitting || !reason.trim()}
          >
            {submitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            {isReject ? "Reject post" : "Request revision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}