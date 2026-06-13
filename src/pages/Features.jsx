import React from "react";
import { Boxes, Database, ShieldCheck, Palette, Server, ClipboardCheck, Wand2, FileText } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Seo from "@/components/seo/Seo";
import { softwareApplicationSchema } from "@/lib/seo";

const features = [
  { icon: Boxes, title: "Product Architecture", desc: "Turn an idea into features, user types, flows, and clear scope." },
  { icon: Database, title: "Entity & Data Model", desc: "Designed entities, relationships, fields, and data rules for KodeBase." },
  { icon: ShieldCheck, title: "Security Model", desc: "Role access, ownership checks, and protected backend functions." },
  { icon: Palette, title: "Page Map", desc: "Complete page structure across user and admin areas." },
  { icon: Server, title: "Backend Plan", desc: "Backend functions, automations, integrations, and APIs." },
  { icon: ClipboardCheck, title: "QA Checklist", desc: "Test cases, launch checklist, and bug-risk areas." },
  { icon: Wand2, title: "Build Prompts", desc: "KodeBase-ready prompts, sequenced and ready to paste." },
  { icon: FileText, title: "Full Blueprint", desc: "Everything compiled into one cohesive build document." },
];

export default function Features() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <Seo
        title="Features — KodeBase"
        description="Architect your app the right way: data models, security rules, page maps, backend plans, QA checklists, and copy-paste build prompts."
        path="/features"
        type="website"
        jsonLd={[softwareApplicationSchema()]}
      />
      <div className="text-center mb-14">
        <PageHeader title="Everything you need to architect a KodeBase app" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card/70 p-7 hover:border-primary/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <f.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-sora font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}