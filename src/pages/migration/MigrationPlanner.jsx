import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Seo from "@/components/seo/Seo";
import PlannerSteps from "@/components/migration/PlannerSteps";
import PlannerFAQ from "@/components/migration/PlannerFAQ";
import PlannerOffer from "@/components/migration/PlannerOffer";
import MigrationDisclaimer from "@/components/migration/MigrationDisclaimer";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/lib/AuthContext";
const OG="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/559f2782f_generated_image.png";
export default function MigrationPlanner(){
 const { isAuthenticated } = useAuth();
 useEffect(()=>trackEvent("migration_planner_view"),[]);
 return <div className="max-w-6xl mx-auto space-y-16 px-6 pt-8 pb-16"><Seo title="Free Base44 Migration Assessment & Quote | KodeBase" description="Get a free Base44 migration workload preview and professional quote, then unlock your complete architecture, security, and migration roadmap for $25." path="/migration-planner" image={OG} />
 <section className="relative overflow-hidden rounded-3xl border border-border bg-card/60 px-6 py-16 text-center blueprint-grid"><div className="absolute inset-0 bg-primary/5"/><div className="relative max-w-3xl mx-auto"><div className="inline-flex gap-2 items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-5"><ShieldCheck className="w-4 h-4"/>Authorized source-code assessment</div><h1 className="font-sora text-4xl md:text-6xl font-extrabold tracking-tight mb-5">Migrate Your <span className="text-gradient-orange">Base44 App</span></h1><p className="text-lg text-muted-foreground mb-7">Create a free account to see how much work your migration may require, receive a professional quote with payment options, and unlock the Full Migration Report when you are ready.</p><div className="flex flex-wrap justify-center gap-3"><Button asChild size="lg" onClick={()=>trackEvent("migration_assessment_start")}><Link to={isAuthenticated ? "/migration-planner/new" : "/register"}>{isAuthenticated ? "Start Your Free Assessment" : "Sign Up for Your Free Assessment"} <ArrowRight className="w-4 h-4"/></Link></Button><Button asChild size="lg" variant="outline"><Link to={isAuthenticated ? "/migration-planner/assessments" : "/login"}>{isAuthenticated ? "My Assessments" : "Already have an account? Sign in"}</Link></Button></div><div className="mt-7 flex flex-wrap justify-center gap-5 text-sm text-muted-foreground">{["Free workload preview","Free quote and payment options","Full report: $25 one-time"].map(x=><span key={x} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary"/>{x}</span>)}</div></div></section>
 <PlannerOffer/><PlannerSteps/><section className="max-w-3xl mx-auto"><h2 className="font-sora text-3xl font-bold text-center mb-8">Frequently asked questions</h2><PlannerFAQ/></section><MigrationDisclaimer/></div>;
}