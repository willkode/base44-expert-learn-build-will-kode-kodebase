import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Seo from "@/components/seo/Seo";
import PlannerSteps from "@/components/migration/PlannerSteps";
import PlannerFAQ from "@/components/migration/PlannerFAQ";
import MigrationDisclaimer from "@/components/migration/MigrationDisclaimer";
import { trackEvent } from "@/lib/analytics";
const OG="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/559f2782f_generated_image.png";
export default function MigrationPlanner(){
 useEffect(()=>trackEvent("migration_planner_view"),[]);
 return <div className="max-w-6xl mx-auto space-y-16 pb-16"><Seo title="Base44 Migration Planner — Secure Repository Assessment | KodeBase" description="Analyze your authorized Base44 GitHub repository, preview migration readiness, and unlock a complete independent-infrastructure migration plan for $25." path="/migration-planner" image={OG} noindex />
 <section className="relative overflow-hidden rounded-3xl border border-border bg-card/60 px-6 py-16 text-center blueprint-grid"><div className="absolute inset-0 bg-primary/5"/><div className="relative max-w-3xl mx-auto"><div className="inline-flex gap-2 items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-5"><ShieldCheck className="w-4 h-4"/>Authorized source-code assessment</div><h1 className="font-sora text-4xl md:text-6xl font-extrabold tracking-tight mb-5">Migrate Your <span className="text-gradient-orange">Base44 App</span></h1><p className="text-lg text-muted-foreground mb-7">Analyze your exported GitHub repository and create a complete plan for moving your app to independent infrastructure you control.</p><div className="flex flex-wrap justify-center gap-3"><Button asChild size="lg" onClick={()=>trackEvent("migration_assessment_start")}><Link to="/migration-planner/new">Start Your Migration Assessment <ArrowRight className="w-4 h-4"/></Link></Button><Button asChild size="lg" variant="outline"><Link to="/migration-planner/assessments">My Assessments</Link></Button></div><div className="mt-7 flex flex-wrap justify-center gap-5 text-sm text-muted-foreground">{["$25 one-time report","Professional migrations from $2,000","No Base44 credentials required"].map(x=><span key={x} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary"/>{x}</span>)}</div></div></section>
 <PlannerSteps/><section className="max-w-3xl mx-auto"><h2 className="font-sora text-3xl font-bold text-center mb-8">Frequently asked questions</h2><PlannerFAQ/></section><MigrationDisclaimer/></div>;
}