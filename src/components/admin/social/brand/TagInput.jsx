import React, { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Comma/Enter-separated tag input that stores an array of strings.
export default function TagInput({ label, value = [], onChange, placeholder, hint }) {
  const [text, setText] = useState("");

  const add = () => {
    const parts = text
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const next = Array.from(new Set([...value, ...parts]));
    onChange(next);
    setText("");
  };

  const remove = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div>
      {label && <Label className="mb-1.5 block">{label}</Label>}
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
          placeholder={placeholder || "Type and press Enter"}
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs"
            >
              {tag}
              <button type="button" onClick={() => remove(tag)} className="hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}