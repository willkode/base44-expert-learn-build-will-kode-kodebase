import React from "react";
import { CalendarDays } from "lucide-react";
import { contentTypeLabel } from "./planConstants";

// Groups planned ideas by their scheduled month/date for a quick visual confirmation
// before generation. Pure preview — does not publish anything.
export default function CalendarPreview({ ideas }) {
  const scheduled = ideas.filter((i) => i.scheduledDate).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  if (scheduled.length === 0) {
    return <p className="text-sm text-muted-foreground">No dates assigned yet.</p>;
  }

  const byMonth = {};
  scheduled.forEach((i) => {
    const key = i.scheduledDate.slice(0, 7);
    (byMonth[key] = byMonth[key] || []).push(i);
  });

  const monthLabel = (key) => {
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-5">
      {Object.keys(byMonth).sort().map((key) => (
        <div key={key}>
          <p className="font-sora font-semibold text-sm mb-2 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" /> {monthLabel(key)}
            <span className="text-xs text-muted-foreground font-normal">({byMonth[key].length})</span>
          </p>
          <div className="space-y-1.5">
            {byMonth[key].map((i, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-lg border border-border bg-card/40 px-3 py-2">
                <span className="text-xs font-mono text-primary w-16 shrink-0">{i.scheduledDate.slice(5)}</span>
                <span className="text-sm truncate flex-1">{i.title}</span>
                <span className="text-[10px] text-muted-foreground capitalize shrink-0">{contentTypeLabel(i.contentType)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}