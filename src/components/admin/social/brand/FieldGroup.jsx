import React from "react";
import { Label } from "@/components/ui/label";

// Small labeled wrapper with optional inline error + hint.
export default function FieldGroup({ label, error, hint, required, children }) {
  return (
    <div>
      {label && (
        <Label className="mb-1.5 block">
          {label} {required && <span className="text-primary">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      ) : null}
    </div>
  );
}