import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 8 posting slots per day, 8am–10pm Central Time (every 2 hours).
export const DAILY_SLOTS = [8, 10, 12, 14, 16, 18, 20, 22];

const slotLabel = (h) => {
  const hr12 = h % 12 === 0 ? 12 : h % 12;
  return `${hr12}:00 ${h < 12 ? "AM" : "PM"}`;
};

const CHICAGO_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

// How far ahead of UTC Central Time is at the given instant (ms, negative).
const chicagoOffsetMs = (date) => {
  const p = {};
  for (const { type, value } of CHICAGO_FMT.formatToParts(date)) p[type] = value;
  const asUTC = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour) % 24,
    Number(p.minute),
    Number(p.second)
  );
  return asUTC - date.getTime();
};

// Build an ISO timestamp for the given date + hour (and optional minute) in
// America/Chicago, regardless of the browser's local timezone.
export const chicagoSlotISO = (dateStr, hour, minute = 0) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const naive = Date.UTC(y, m - 1, d, hour, minute, 0);
  const offset = chicagoOffsetMs(new Date(naive));
  return new Date(naive - offset).toISOString();
};

export default function OcoyaSlotPicker({ value, onChange }) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState(null);
  const [manualTime, setManualTime] = useState("");
  const [mode, setMode] = useState("slot");

  // Ocoya requires a schedule time at least 2 minutes from now.
  const earliest = new Date(Date.now() + 2 * 60 * 1000);

  const pickSlot = (d, h) => {
    if (!d || h === null) return;
    onChange(chicagoSlotISO(d, h));
  };

  const pickManual = (d, t) => {
    if (!d || !t) return;
    const [h, m] = t.split(":").map(Number);
    onChange(chicagoSlotISO(d, h, m));
  };

  const isPast = (h) => {
    if (!date) return false;
    return new Date(chicagoSlotISO(date, h)) <= earliest;
  };

  const manualIsPast =
    date &&
    manualTime &&
    new Date(chicagoSlotISO(date, ...manualTime.split(":").map(Number))) <= earliest;

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
            if (mode === "slot" && slot !== null) pickSlot(e.target.value, slot);
            if (mode === "manual" && manualTime) pickManual(e.target.value, manualTime);
          }}
        />
      </div>

      {date && (
        <>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "slot", label: "Preset time slot" },
              { id: "manual", label: "Custom time" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id);
                  if (m.id === "slot" && slot !== null) pickSlot(date, slot);
                  if (m.id === "manual" && manualTime) pickManual(date, manualTime);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  mode === m.id
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary/40"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode === "slot" ? (
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
                        pickSlot(date, h);
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
          ) : (
            <div className="space-y-2 max-w-xs">
              <Label>Custom time (CST)</Label>
              <Input
                type="time"
                value={manualTime}
                onChange={(e) => {
                  setManualTime(e.target.value);
                  pickManual(date, e.target.value);
                }}
              />
              {manualIsPast && (
                <p className="text-xs text-destructive">
                  Pick a time at least 2 minutes from now (Central Time).
                </p>
              )}
            </div>
          )}
        </>
      )}

      {value && date && mode === "slot" && slot !== null && (
        <p className="text-xs text-muted-foreground">
          Scheduled for {date} at {slotLabel(slot)} CST
        </p>
      )}
      {value && date && mode === "manual" && manualTime && !manualIsPast && (
        <p className="text-xs text-muted-foreground">
          Scheduled for {date} at {manualTime} CST
        </p>
      )}
    </div>
  );
}