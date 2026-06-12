import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const CONSENT_OPTIONS = ["unknown", "opted_in", "imported", "manually_added", "double_opt_in_pending"];
const EMPTY = { email: "", firstName: "", lastName: "", company: "", phone: "", tags: "", source: "manual", consentStatus: "manually_added", consentSource: "" };

export default function ContactFormDialog({ open, onOpenChange, contact, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const isEdit = !!contact;

  useEffect(() => {
    if (open) {
      setForm(contact
        ? { ...EMPTY, ...contact, tags: (contact.tags || []).join(", ") }
        : EMPTY);
    }
  }, [open, contact]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const res = isEdit
        ? await base44.functions.invoke("updateEmailContact", { contactId: contact.id, updates: data })
        : await base44.functions.invoke("createEmailContact", { contact: data });
      if (res.data?.error) throw new Error(res.data.error);
      if (res.data?.syncWarning) toast.warning(`Saved, but Resend sync failed: ${res.data.syncWarning}`);
      else toast.success(isEdit ? "Contact updated" : "Contact added");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Could not save contact");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sora">{isEdit ? "Edit Contact" : "Add Contact"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="col-span-2">
            <Label className="mb-1.5 block text-sm">Email *</Label>
            <Input value={form.email} disabled={isEdit} placeholder="name@example.com" onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">First name</Label>
            <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Last name</Label>
            <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Company</Label>
            <Input value={form.company} onChange={(e) => set("company", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Phone</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label className="mb-1.5 block text-sm">Tags (comma separated)</Label>
            <Input value={form.tags} placeholder="newsletter, vip" onChange={(e) => set("tags", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Source</Label>
            <Input value={form.source} onChange={(e) => set("source", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Consent status</Label>
            <Select value={form.consentStatus} onValueChange={(v) => set("consentStatus", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONSENT_OPTIONS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className="mb-1.5 block text-sm">Consent source</Label>
            <Input value={form.consentSource} placeholder="e.g. website signup form" onChange={(e) => set("consentSource", e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.email.trim()}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? "Save changes" : "Add contact"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}