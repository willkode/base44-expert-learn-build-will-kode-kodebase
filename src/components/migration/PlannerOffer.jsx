import { CheckCircle2, FileSearch, FileText, ReceiptText } from "lucide-react";

const offers = [
  {
    icon: FileSearch,
    label: "Free with your account",
    title: "Migration overview and quote",
    items: ["Work and complexity overview", "Free professional migration quote", "Payment options for your quote"],
  },
  {
    icon: FileText,
    label: "$25 one-time unlock",
    title: "Full Migration Report",
    items: ["Complete dependency and architecture map", "Security and remediation plan", "Phased migration roadmap and testing checklist"],
  },
];

export default function PlannerOffer() {
  return <section><div className="text-center mb-8"><p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What you receive</p><h2 className="font-sora text-3xl font-bold">Start free. Unlock the full plan when ready.</h2></div><div className="grid md:grid-cols-2 gap-4">{offers.map(({ icon: Icon, label, title, items })=><div key={title} className="rounded-2xl border border-border bg-card/60 p-6"><div className="flex items-center gap-3 mb-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="w-5 h-5" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-primary">{label}</p><h3 className="font-sora font-semibold text-lg">{title}</h3></div></div><ul className="space-y-3">{items.map(item=><li key={item} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />{item}</li>)}</ul></div>)}</div><div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ReceiptText className="w-4 h-4 text-primary" />Your free quote includes available ways to pay for professional migration.</div></section>;
}