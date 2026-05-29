import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TextField({ label, helper, value, onChange, placeholder, required }) {
  return (
    <div className="space-y-1.5">
      <Label>{label} {required && <span className="text-primary">*</span>}</Label>
      <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11" />
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

export function AreaField({ label, helper, value, onChange, placeholder, required }) {
  return (
    <div className="space-y-1.5">
      <Label>{label} {required && <span className="text-primary">*</span>}</Label>
      <Textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-h-24" />
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}