import React from "react";
import { ShieldAlert, AlertOctagon, AlertTriangle, ShieldCheck, BadgeCheck } from "lucide-react";

// Score-based dashboard alert banner.
const BANDS = [
  { min: 90, label: "Launch Ready", icon: BadgeCheck, cls: "border-green-500/30 bg-green-500/10 text-green-300",
    msg: "Your app passed the security review. Keep scanning after major changes to stay launch-ready." },
  { min: 75, label: "Mostly Secure", icon: ShieldCheck, cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    msg: "Your app is mostly secure. Clear the remaining issues to reach launch-ready status." },
  { min: 60, label: "Needs Review", icon: AlertTriangle, cls: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    msg: "Some security issues need review. Open the Issues tab and copy the AI fix prompts to resolve them." },
  { min: 40, label: "High Risk", icon: ShieldAlert, cls: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    msg: "Your app is at high risk. Address the high and critical issues before going live." },
  { min: 0, label: "Critical Risk", icon: AlertOctagon, cls: "border-red-500/30 bg-red-500/10 text-red-300",
    msg: "Critical security risks detected. Resolve critical issues immediately before exposing this app to users." },
];

export default function ScoreBanner({ score }) {
  if (score == null) return null;
  const band = BANDS.find((b) => score >= b.min) || BANDS[BANDS.length - 1];
  const Icon = band.icon;
  return (
    <div className={`rounded-2xl border p-4 flex items-start gap-3 ${band.cls}`}>
      <div className="w-9 h-9 rounded-lg bg-background/30 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="font-sora font-semibold text-sm">{band.label} — {Math.round(score)}/100</p>
        <p className="text-xs opacity-90 mt-0.5">{band.msg}</p>
      </div>
    </div>
  );
}