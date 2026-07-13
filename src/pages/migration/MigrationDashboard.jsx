import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import ProjectCard from "@/components/migration/ProjectCard";
import { trackEvent } from "@/lib/analytics";
export default function MigrationDashboard(){const [projects,setProjects]=useState(null);useEffect(()=>{trackEvent("migration_dashboard_view");base44.functions.invoke("migrationAssessment",{action:"list"}).then(r=>setProjects(r.data.projects.filter(p=>!p.archived)))},[]);if(!projects)return <LoadingState label="Loading assessments…"/>;return <div className="max-w-6xl mx-auto"><div className="flex justify-between items-end mb-8"><div><p className="text-sm text-primary font-semibold">MIGRATION PLANNER</p><h1 className="font-sora text-3xl font-bold">Your assessments</h1></div><Button asChild><Link to="/migration-planner/new"><Plus className="w-4 h-4"/>New assessment</Link></Button></div>{!projects.length?<EmptyState title="No migration assessments yet" description="Connect an authorized repository to receive a free readiness preview." actionLabel="Start assessment" onAction={()=>window.location.href="/migration-planner/new"}/>:<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{projects.map(p=><ProjectCard key={p.id} project={p}/>)}</div>}</div>;}