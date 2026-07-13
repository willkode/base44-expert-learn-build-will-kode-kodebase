import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft,ArrowRight,Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import AuthorizationStep from "@/components/migration/AuthorizationStep";
import RepositoryStep from "@/components/migration/RepositoryStep";
import ApplicationInfoStep from "@/components/migration/ApplicationInfoStep";
import MigrationDisclaimer from "@/components/migration/MigrationDisclaimer";
import { trackEvent } from "@/lib/analytics";
const labels=["Authorization","Repository","Application","Review"];
export default function NewMigrationAssessment(){
 const nav=useNavigate(),[step,setStep]=useState(0),[confirmations,setConfirmations]=useState({}),[repo,setRepo]=useState({repository_source:"github"}),[info,setInfo]=useState({}),[saving,setSaving]=useState(false),[error,setError]=useState("");
 useEffect(()=>trackEvent("migration_assessment_wizard_view"),[]);
 const valid=step===0?Object.values(confirmations).filter(Boolean).length===3:step===1?(repo.repository_source==="github"?repo.github_repository&&repo.github_branch:repo.zip_file_uri):step===2?info.application_name&&info.desired_timeline:true;
 const submit=async()=>{setSaving(true);setError("");try{const r=await base44.functions.invoke("migrationAssessment",{action:"create",confirmations,...repo,...info});trackEvent("migration_assessment_created",{source:repo.repository_source});nav(`/migration-planner/projects/${r.data.project.id}?start=1`)}catch(e){setError(e.response?.data?.error||e.message)}setSaving(false)};
 return <div className="max-w-3xl mx-auto"><div className="flex gap-2 mb-8">{labels.map((l,i)=><div key={l} className="flex-1"><div className={`h-1 rounded ${i<=step?"bg-primary":"bg-secondary"}`}/><p className="hidden sm:block text-xs mt-2 text-muted-foreground">{l}</p></div>)}</div><div className="rounded-2xl border border-border bg-card/60 p-6 md:p-8">{step===0&&<AuthorizationStep value={confirmations} onChange={setConfirmations}/>} {step===1&&<RepositoryStep value={repo} onChange={setRepo}/>} {step===2&&<ApplicationInfoStep value={info} onChange={setInfo}/>} {step===3&&<div className="space-y-5"><h2 className="font-sora text-2xl font-bold">Ready to scan</h2><p className="text-muted-foreground">We’ll inspect the authorized source deterministically, redact detected secrets, persist progress, and prepare your free readiness preview.</p><div className="rounded-xl bg-secondary/50 p-4 text-sm"><p><b>Application:</b> {info.application_name}</p><p><b>Source:</b> {repo.repository_source==="github"?`${repo.github_owner}/${repo.github_repository} · ${repo.github_branch}`:repo.zip_name}</p></div><MigrationDisclaimer/></div>}{error&&<p className="mt-5 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<div className="flex justify-between mt-8"><Button variant="outline" disabled={step===0||saving} onClick={()=>setStep(s=>s-1)}><ArrowLeft className="w-4 h-4"/> Back</Button>{step<3?<Button disabled={!valid} onClick={()=>setStep(s=>s+1)}>Continue <ArrowRight className="w-4 h-4"/></Button>:<Button disabled={saving} onClick={submit}>{saving?<Loader2 className="w-4 h-4 animate-spin"/>:null}Start repository scan</Button>}</div></div></div>;
}