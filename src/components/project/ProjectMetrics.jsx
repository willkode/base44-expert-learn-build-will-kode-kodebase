import React from "react";
import { Rocket, ListChecks, ShieldCheck, ClipboardCheck } from "lucide-react";

function pct(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

function MetricCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="font-sora font-bold text-3xl">{value}%</div>
      <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${value}%` }} />
      </div>
      {sub && <p className="text-xs text-muted-foreground mt-2">{sub}</p>}
    </div>
  );
}

export default function ProjectMetrics({ prompts, security, qa }) {
  const promptsTotal = prompts.length;
  const promptsDone = prompts.filter((p) => p.status === "completed").length;
  const secTotal = security.length;
  const secDone = security.filter((s) => s.fixedStatus === "resolved").length;
  const qaTotal = qa.length;
  const qaDone = qa.filter((q) => q.status === "passed").length;

  const appProgress = pct(promptsDone, promptsTotal);
  const secProgress = pct(secDone, secTotal);
  const qaProgress = pct(qaDone, qaTotal);

  const totalItems = promptsTotal + secTotal + qaTotal;
  const totalDone = promptsDone + secDone + qaDone;
  const launchReady = pct(totalDone, totalItems);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={Rocket}
        label="Launch Ready"
        value={launchReady}
        sub={`${totalDone}/${totalItems} items complete`}
        accent="bg-primary/15 text-primary"
      />
      <MetricCard
        icon={ListChecks}
        label="App Progress"
        value={appProgress}
        sub={`${promptsDone}/${promptsTotal} prompts done`}
        accent="bg-blue-500/15 text-blue-400"
      />
      <MetricCard
        icon={ShieldCheck}
        label="Security Review"
        value={secProgress}
        sub={`${secDone}/${secTotal} resolved`}
        accent="bg-green-500/15 text-green-400"
      />
      <MetricCard
        icon={ClipboardCheck}
        label="QA Checklist"
        value={qaProgress}
        sub={`${qaDone}/${qaTotal} passed`}
        accent="bg-purple-500/15 text-purple-400"
      />
    </div>
  );
}