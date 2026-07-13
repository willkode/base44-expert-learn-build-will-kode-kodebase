import { GitBranch, FileLock2, Rocket } from "lucide-react";

const steps = [
  [GitBranch, "Connect your repository", "Authorize GitHub securely or upload an exported ZIP."],
  [FileLock2, "Review your free results", "See the workload overview and receive a professional migration quote with payment options."],
  [Rocket, "Unlock or move forward", "Unlock the Full Migration Report for $25, or proceed with your professional migration quote."],
];
export default function PlannerSteps() {
  return <div className="grid md:grid-cols-3 gap-4">{steps.map(([Icon,title,text],i)=><div key={title} className="rounded-2xl border border-border bg-card/60 p-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4"><Icon className="w-5 h-5" /></div><p className="text-xs text-primary font-bold mb-1">STEP {i+1}</p><h3 className="font-sora font-semibold mb-2">{title}</h3><p className="text-sm text-muted-foreground">{text}</p></div>)}</div>;
}