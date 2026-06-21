import React, { useState, useEffect } from "react";
import { Gift } from "lucide-react";

// Sale ends 11:59pm CST (America/Chicago) today. CST is UTC-6, CDT is UTC-5.
// In June, Chicago observes CDT (UTC-5), so 23:59 local = 04:59 next-day UTC.
// We compute the deadline from the current Chicago date to be DST-correct.
function getDeadline() {
  const now = new Date();
  const chicagoNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const offsetMs = now.getTime() - chicagoNow.getTime();
  const endLocal = new Date(chicagoNow);
  endLocal.setHours(23, 59, 59, 999);
  return new Date(endLocal.getTime() + offsetMs);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function FathersDayBanner() {
  const [deadline] = useState(getDeadline);
  const [remaining, setRemaining] = useState(() => deadline.getTime() - Date.now());

  useEffect(() => {
    const t = setInterval(() => setRemaining(deadline.getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [deadline]);

  if (remaining <= 0) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-[#f87171]/10 via-[#fb923c]/10 to-[#facc15]/10 px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary shrink-0" />
          <span className="font-sora font-bold text-base md:text-lg">
            Father's Day Special — <span className="text-gradient-orange">everything $5</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ends 11:59pm CST in</span>
          <div className="flex items-center gap-1.5 font-sora font-extrabold text-foreground tabular-nums">
            {[
              { v: hours, l: "h" },
              { v: minutes, l: "m" },
              { v: seconds, l: "s" },
            ].map(({ v, l }) => (
              <span key={l} className="bg-card border border-border rounded-md px-2 py-1 text-sm">
                {pad(v)}<span className="text-muted-foreground font-normal ml-0.5">{l}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}