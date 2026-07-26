import React from "react";
import { Badge } from "@/components/ui/badge";
import { MoveRight, Server } from "lucide-react";

export default function PorterHero() {
  return (
    <section className="relative overflow-hidden blueprint-grid border-b border-border">
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Badge className="mb-5 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-white border-0">
          Free tool · No payment, ever
        </Badge>
        <h1 className="font-sora text-4xl md:text-6xl font-extrabold tracking-tight">
          Move the frontend.{" "}
          <span className="text-gradient-orange">Keep the backend.</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          A desktop tool that ports a Base44 frontend onto your own domain, CDN or deployment
          pipeline — still wired to the same Base44 backend, with the same entities, auth,
          functions and data. No fork. No empty database.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <Server className="w-4 h-4 text-primary" /> Base44 backend
          </span>
          <MoveRight className="w-4 h-4 text-primary" />
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            Your hosting
          </span>
        </div>
      </div>
    </section>
  );
}