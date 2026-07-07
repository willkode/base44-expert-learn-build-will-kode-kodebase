import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 8 posting slots per day, 8am–10pm Central Time (every 2 hours).
export const DAILY_SLOTS = [8, 10, 12, 14, 16, 18, 20, 22];

const slotLabel = (h) => {
  const hr12 = h % 12 === 0 ? 12 : h % 12;
  return `${hr12}:00 ${h < 12 ? "AM" : "PM"}`;
};

// Build an ISO timestamp for the given date + hour in America/Chicago,
// regardless of the browser's local timezone.
export const chicagoSlotISO = (dateStr, hour) => {
  const guess = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:00:00Z`);
  const asChicago = new Date(guess.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  return new Date(guess.getTime() + (guess.getTime() - asChicago.getTime())).toISOString();
};

export default function OcoyaSlotPicker({ value, onChange }) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState(null);

  const pick = (d, h) => {
    if (!d || h === null) return;
    onChange(chicagoSlotISO(d, h));
  };

  const now = new Date();
  const isPast = (h) => {
    if (!date) return false;
    return new Date(chicagoSlotISO(date, h)) <= now;
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-w-xs">
        <Label>Schedule day</Label>
        <Input
          type="date"
          value={date}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => {
            setDate(e.target.value);
            if (slot !== null) pick(e.target.value, slot);
          }}
        />
      </div>
      {date && (
        <div className="space-y-2">
          <Label>Time slot (CST — 8 posts per day)</Label>
          <div className="grid grid-cols-4 gap-2 max-w-md">
            {DAILY_SLOTS.map((h) => {
              const disabled = isPast(h);
              return (
                <button
                  key={h}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setSlot(h);
                    pick(date, h);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    slot === h
                      ? "border-primary bg-primary/10 text-foreground"
                      : disabled
                      ? "border-border text-muted-foreground/40 cursor-not-allowed"
                      : "border-border text-muted-foreground hover:bg-secondary/40"
                  }`}
                >
                  {slotLabel(h)}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {value && date && slot !== null && (
        <p className="text-xs text-muted-foreground">
          Scheduled for {date} at {slotLabel(slot)} CST
        </p>
      )}
    </div>
  );
}