import React from "react";
import useMigrationPrice from "./useMigrationPrice";

export default function MigrationSpotCounter() {
  const { remaining, claimed, held, soldOut, loading, unavailable, refresh } = useMigrationPrice();
  if (loading) return <p className="text-sm text-slate-300" role="status">Checking promotional spots…</p>;
  if (unavailable) return <div className="text-sm text-slate-300" role="status">We couldn't confirm availability. <button type="button" className="underline underline-offset-4" onClick={() => refresh()}>Retry</button></div>;
  return <div className="w-full" aria-live="polite">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="font-semibold text-orange-200">{soldOut ? "All 10 promotional spots have been claimed" : remaining > 0 ? remaining + " of 10 spots available" : "All remaining spots are temporarily held at checkout"}</p>
      <p className="text-xs text-slate-300">{claimed} purchased{held > 0 ? " · " + held + " held at checkout" : ""}</p>
    </div>
    <div className="mt-3 flex gap-1.5" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <span key={i} className={"h-2.5 flex-1 rounded-full " + (i < claimed ? "bg-orange-400" : i < claimed + held ? "bg-amber-200/60" : "bg-slate-600")} />)}</div>
    <p className="mt-3 text-xs leading-relaxed text-slate-300">{soldOut ? "The standard $199 migration price now applies." : "First 10 customers · One discounted migration per customer. Checkout holds last 30 minutes; unpaid spots return after payment-link cancellation is confirmed."}</p>
  </div>;
}
