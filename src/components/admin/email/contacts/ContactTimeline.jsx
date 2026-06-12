import React from "react";
import { Mail, MousePointerClick, ScrollText, Clock } from "lucide-react";

const ICONS = { send: Mail, event: MousePointerClick, log: ScrollText };

export default function ContactTimeline({ timeline }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <h3 className="font-sora font-semibold mb-4">Timeline</h3>
      {timeline.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-muted-foreground">
          <Clock className="w-8 h-8 mb-3" />
          <p className="text-sm">No activity yet for this contact.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {timeline.map((item, i) => {
            const Icon = ICONS[item.type] || Clock;
            return (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm break-words">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.date ? new Date(item.date).toLocaleString() : ""}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}