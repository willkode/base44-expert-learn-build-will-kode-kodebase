import { Hammer, Headphones, Wrench, Shield, TrendingUp, Heart, Database, Rocket } from "lucide-react";

export const SERVICES = [
  { label: "Custom App Creation", to: "/services/custom-app-creation", icon: Hammer, badge: "NEW", desc: "A complete, production-ready Base44 app designed and built to your spec — planning, build, security and launch included." },
  { label: "Kode Sessions", to: "/services/kode-sessions", icon: Headphones, desc: "1-on-1 expert sessions where we work through your app live — architecture, prompts, bugs and strategy." },
  { label: "ER Service", to: "/services/er-service", icon: Wrench, desc: "Emergency app repair when your build is broken, stuck in an AI loop, or down in production." },
  { label: "Security Audit + Fix", to: "/services/security-audit", icon: Shield, desc: "A full security review of entities, permissions and functions — with the fixes applied, not just a report." },
  { label: "SEO Audit + Fix", to: "/services/seo-audit", icon: TrendingUp, badge: "NEW", desc: "Find and fix what's hurting your rankings — metadata, structure, indexing and page performance." },
  { label: "KodeCare", to: "/services/kodecare", icon: Heart, desc: "Ongoing monthly support retainers so you always have an expert on call for your app." },
  { label: "Base44 BaaS", to: "/services/base44-baas", icon: Database, badge: "NEW", desc: "A scalable external backend for your app — keep building fast without outgrowing your stack." },
  { label: "App Migration", to: "/services/base44-migration", icon: Rocket, badge: "NEW", desc: "Move your Base44 app to your own stack and hosting with your data, auth and features intact." },
];