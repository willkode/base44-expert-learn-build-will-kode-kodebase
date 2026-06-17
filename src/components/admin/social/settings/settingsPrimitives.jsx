import React from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Section card wrapper.
export function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3 mb-4">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-4.5 h-4.5 text-primary" />
          </div>
        )}
        <div>
          <h3 className="font-sora font-semibold text-base">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="space-y-1">{children}</div>
    </Card>
  );
}

// A labeled toggle row.
export function ToggleRow({ label, description, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border/50 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Switch checked={!!checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

// A labeled numeric input row.
export function NumberRow({ label, description, value, onChange, min = 0, max, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border/50 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Input
        type="number"
        min={min}
        max={max}
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="h-8 w-24 text-sm text-right"
      />
    </div>
  );
}

// A labeled text/textarea field.
export function FieldRow({ label, description, children }) {
  return (
    <div className="py-2.5 border-b border-border/50 last:border-0 space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}