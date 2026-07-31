import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Phone } from "lucide-react";
import { SOURCE_LABELS } from "./crmSources";

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <div className="text-sm text-foreground">{children || "—"}</div>
    </div>
  );
}

export default function CrmSubmissionDialog({ submission, onClose }) {
  const s = submission;
  return (
    <Dialog open={!!s} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        {s && (
          <>
            <DialogHeader>
              <DialogTitle className="font-sora">
                {s.name || s.email || "Submission"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Source">{SOURCE_LABELS[s.source]}</Field>
                <Field label="Received">
                  {s.created_date ? new Date(s.created_date).toLocaleString() : null}
                </Field>
                <Field label="Name">{s.name}</Field>
                <Field label="Status">
                  <span className="capitalize">{s.status || "—"}</span>
                </Field>
                <Field label="Email">{s.email}</Field>
                <Field label="Phone">{s.phone}</Field>
              </div>
              <Field label="Subject">{s.subject}</Field>
              <Field label="Message">
                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {s.message || "—"}
                </p>
              </Field>
              <div className="flex flex-wrap gap-2 pt-2">
                {s.email && (
                  <a href={`mailto:${s.email}`}>
                    <Button size="sm">
                      <Mail className="w-4 h-4" /> Reply by email
                    </Button>
                  </a>
                )}
                {s.phone && (
                  <a href={`tel:${s.phone}`}>
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4" /> Call
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}