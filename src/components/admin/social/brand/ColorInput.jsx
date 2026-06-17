import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Brand color list — stores an array of hex strings.
export default function ColorInput({ label, value = [], onChange }) {
  const [hex, setHex] = useState("#f87171");

  const add = () => {
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) return;
    if (value.includes(hex)) return;
    onChange([...value, hex]);
  };
  const remove = (c) => onChange(value.filter((x) => x !== c));

  return (
    <div>
      {label && <Label className="mb-1.5 block">{label}</Label>}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#([0-9a-fA-F]{6})$/.test(hex) ? hex : "#f87171"}
          onChange={(e) => setHex(e.target.value)}
          className="h-9 w-12 rounded-md border border-input bg-transparent cursor-pointer"
        />
        <Input value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#000000" className="w-32" />
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {value.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-background/40 text-xs">
              <span className="w-4 h-4 rounded-sm border border-border" style={{ backgroundColor: c }} />
              {c}
              <button type="button" onClick={() => remove(c)} className="hover:text-foreground text-muted-foreground">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}