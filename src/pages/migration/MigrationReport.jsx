import { useState } from "react";
import { useParams,Link } from "react-router-dom";
import { Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import ReportSections from "@/components/migration/ReportSections";
import MigrationDisclaimer from "@/components/migration/MigrationDisclaimer";
import useMigrationProject from "@/hooks/useMigrationProject";
export default function MigrationReport(){const {id}=useParams(),[downloading,setDownloading]=useState(false);const {data,loading,error}=useMigrationProject(id);const download=async()=>{setDownloading(true);const r=await base44.functions.invoke("exportMigrationReport",{project_id:id});window.location.href=r.data.download_url;setDownloading(false)};if(loading)return <LoadingState label="Loading report…"/>;if(error||!data?.entitled)return <ErrorState description={error||"Report access is required."}/>;if(data.report.status!=="ready")return <LoadingState label="Generating your complete migration plan…"/>;return <div className="max-w-4xl mx-auto space-y-6"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-sm text-primary font-semibold">COMPLETE MIGRATION PLAN</p><h1 className="font-sora text-3xl font-bold">{data.project.application_name}</h1><p className="text-sm text-muted-foreground">Version {data.report.report_version} · {data.report.complexity_level} complexity</p></div><div className="flex gap-2"><Button variant="outline" onClick={download} disabled={downloading}><Download className="w-4 h-4"/>{downloading?"Preparing…":"Download PDF"}</Button><Button asChild><Link to={`/migration-planner/projects/${id}/quote`}>View quote</Link></Button></div></div><ReportSections report={data.report.full_report}/><MigrationDisclaimer/></div>;}