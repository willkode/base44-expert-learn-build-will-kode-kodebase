import { Database, FunctionSquare, Plug, KeyRound, Clock, ShieldAlert, Radio, CreditCard, FileCode2 } from "lucide-react";

export default function AssessmentScorecard({ scan, report }) {
  if (!scan || scan.status !== "completed") return null;
  const counters = [
    ["Files reviewed", scan.files_reviewed, FileCode2],
    ["Entities", scan.entities_detected, Database],
    ["Backend functions", scan.functions_detected, FunctionSquare],
    ["Integrations", scan.integrations_detected, Plug],
    ["Auth methods", scan.auth_methods_detected?.length, KeyRound],
    ["Automations", scan.automations_detected, Clock],
    ["Security findings", scan.security_findings_count, ShieldAlert],
    ["Realtime", scan.realtime_detected ? "Yes" : "No", Radio],
    ["Payments", scan.payment_features_detected ? "Yes" : "No", CreditCard],
  ];
  const score = report?.readiness_score;
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-sm text-primary font-semibold">APP SCORECARD</p>
          <p className="text-sm text-muted-foreground">Everything our deterministic scan verified in your codebase.</p>
        </div>
        {score != null && (
          <div className="text-right">
            <p className="text-3xl font-sora font-bold">{score}<span className="text-base text-muted-foreground">/100</span></p>
            <p className="text-xs text-muted-foreground">Readiness · {report.complexity_level} complexity</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {counters.map(([label, value, Icon]) => (
          <div key={label} className="rounded-xl bg-secondary/50 p-4 text-center">
            <Icon className="w-4 h-4 text-primary mx-auto mb-2" />
            <p className="font-sora font-bold text-2xl">{value ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}