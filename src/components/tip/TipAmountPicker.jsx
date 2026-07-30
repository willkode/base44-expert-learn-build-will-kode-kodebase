import React from "react";
import { Input } from "@/components/ui/input";

const PRESETS = [
  { cents: 300, label: "$3", note: "Nice one" },
  { cents: 1000, label: "$10", note: "Very kind" },
  { cents: 2500, label: "$25", note: "Legend" },
  { cents: 5000, label: "$50", note: "Hero" },
];

export default function TipAmountPicker({ selected, custom, onSelect, onCustom }) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {PRESETS.map((p) => {
          const active = !custom && selected === p.cents;
          return (
            <button
              key={p.cents}
              onClick={() => onSelect(p.cents)}
              className={`rounded-xl border py-4 flex flex-col items-center gap-1 transition-colors ${
                active ? "border-primary bg-primary/10" : "border-border bg-secondary hover:border-primary/40"
              }`}
            >
              <span className="font-sora font-bold text-lg">{p.label}</span>
              <span className="text-xs text-muted-foreground">{p.note}</span>
            </button>
          );
        })}
      </div>

      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block">Or enter your own amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            type="number"
            min="1"
            max="500"
            step="1"
            value={custom}
            onChange={(e) => onCustom(e.target.value)}
            placeholder="15"
            className="pl-7 bg-secondary border-border"
          />
        </div>
      </div>
    </>
  );
}