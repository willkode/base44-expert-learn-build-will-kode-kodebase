import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Clock,
  BadgeCheck,
  ArrowLeft,
  AlertTriangle,
  Lock,
  Bug,
  Gauge,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const WHAT_YOU_GET = [
  { icon: ShieldCheck, title: "Security hardening", text: "Row-level security, permissions and access rules reviewed by security experts." },
  { icon: Bug, title: "Bug & flow audit", text: "Every core user flow tested end-to-end so nothing breaks for your real users." },
  { icon: Gauge, title: "Performance & scale", text: "Architecture and data model checked for speed and scalability under real load." },
  { icon: Sparkles, title: "Targeted optimization prompts", text: "Highly targeted prompts built by our industry-leading prompt engineer team to fix issues and improve your app." },
  { icon: CheckCircle2, title: "Launch sign-off", text: "A clear, prioritized report confirming your app is 100% ready to launch." },
];

const RISKS = [
  "Exposed data from missing or misconfigured access rules.",
  "Broken flows that silently fail and cost you users on day one.",
  "Slow pages and crashes when traffic grows.",
  "Costly emergency fixes and reputation damage after launch.",
];

export default function LaunchAudit() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate(`/projects/${id}/overview`)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to overview
      </button>

      {/* Hero */}
      <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/15 to-card/60 p-8 glow-orange">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="font-sora font-bold text-2xl md:text-3xl">Launch Ready Audit</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Before you put your app in front of real users, have our team of experienced developers,
          architects, engineers and security experts make sure it's 100% ready for launch.
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-5 text-sm">
          <span className="flex items-center gap-1.5 text-foreground">
            <BadgeCheck className="w-4 h-4 text-primary" /> One time fee <strong>$75 USD</strong>
          </span>
          <span className="flex items-center gap-1.5 text-foreground">
            <Clock className="w-4 h-4 text-primary" /> Completed within 24 hrs
          </span>
        </div>
        <Button
          onClick={() => toast.success("Audit request received — our team will reach out shortly.")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 px-6 mt-6"
        >
          Order Audit — $75
        </Button>
      </div>

      {/* What it is / what you get */}
      <div>
        <h2 className="font-sora font-semibold text-xl mb-4">What's included</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WHAT_YOU_GET.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card/70 p-5">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-3">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why you need it */}
      <div className="rounded-2xl border border-border bg-card/70 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="font-sora font-semibold text-xl">Why you need it</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-built apps ship fast, but small oversights in security, permissions or data flows are
          easy to miss and hard to catch on your own. A second set of expert eyes catches the issues
          that turn into expensive problems later — giving you the confidence to launch.
        </p>
      </div>

      {/* Risk of going without */}
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h2 className="font-sora font-semibold text-xl">The risk of going without one</h2>
        </div>
        <ul className="space-y-2">
          {RISKS.map((risk) => (
            <li key={risk} className="flex items-start gap-2 text-sm text-foreground">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              {risk}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center pb-4">
        <Button
          onClick={() => toast.success("Audit request received — our team will reach out shortly.")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 px-8"
        >
          Order your Launch Ready Audit — $75
        </Button>
      </div>
    </div>
  );
}