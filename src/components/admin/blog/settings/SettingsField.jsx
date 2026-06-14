import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function SettingsCard({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
      <div>
        <h2 className="font-sora font-semibold text-base flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-primary" />} {title}
        </h2>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function TextField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function AreaField({ label, value, onChange, placeholder, className = "h-20" }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <Textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={className} />
    </div>
  );
}

export function ListField({ label, value, onChange, placeholder }) {
  // Comma-separated input bound to a string[] field.
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <Textarea
        value={Array.isArray(value) ? value.join(", ") : (value || "")}
        onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
        placeholder={placeholder}
        className="h-16"
      />
      <p className="text-xs text-muted-foreground mt-1">Separate with commas.</p>
    </div>
  );
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div className="pr-4">
        <Label>{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={!!checked} onCheckedChange={onChange} />
    </div>
  );
}