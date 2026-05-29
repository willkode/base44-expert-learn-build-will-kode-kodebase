import React from "react";
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Gauge } from "lucide-react";

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={`w-4.5 h-4.5 ${color}`} />
      </div>
      <div className="font-sora font-bold text-2xl md:text-3xl">{value}</div>
    </div>
  );
}

export default function QASummary({ total, passed, failed, pending, readiness }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <Stat icon={ClipboardCheck} label="Total tests" value={total} color="text-primary" />
      <Stat icon={CheckCircle2} label="Passed" value={passed} color="text-green-400" />
      <Stat icon={XCircle} label="Failed" value={failed} color="text-destructive" />
      <Stat icon={Clock} label="Pending" value={pending} color="text-muted-foreground" />
      <Stat icon={Gauge} label="Readiness" value={`${readiness}%`} color="text-chart-2" />
    </div>
  );
}