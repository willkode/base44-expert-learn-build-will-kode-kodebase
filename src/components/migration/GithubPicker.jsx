import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";
const CONNECTOR_ID="6a550f001ae3ab15be249828";
export default function GithubPicker({value,onChange}){
 const [repos,setRepos]=useState([]),[branches,setBranches]=useState([]),[connected,setConnected]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=async()=>{setLoading(true);setError("");try{const r=await base44.functions.invoke("migrationGithub",{action:"repositories"});setRepos(r.data.repositories);setConnected(true)}catch(e){setConnected(false);setError(e.response?.data?.error||"")}setLoading(false)};
 useEffect(()=>{load()},[]);
 const connect=async()=>{const url=await base44.connectors.connectAppUser(CONNECTOR_ID);const popup=window.open(url,"_blank");const t=setInterval(()=>{if(!popup||popup.closed){clearInterval(t);load()}},500)};
 const disconnect=async()=>{await base44.connectors.disconnectAppUser(CONNECTOR_ID);setConnected(false);setRepos([]);setBranches([]);onChange({})};
 const pickRepo=async full=>{const repo=repos.find(r=>r.full_name===full);onChange({github_owner:repo.owner,github_repository:repo.name,github_repository_id:repo.id,github_branch:repo.default_branch,repository_visibility:repo.private?"private":"public"});const r=await base44.functions.invoke("migrationGithub",{action:"branches",owner:repo.owner,repo:repo.name});setBranches(r.data.branches)};
 if(loading)return <p className="text-sm text-muted-foreground">Checking GitHub connection…</p>;
 if(!connected)return <div className="rounded-xl border border-border p-5"><p className="font-semibold">Connect GitHub</p><p className="text-sm text-muted-foreground my-2">Authorize access to repositories you can already access. Tokens stay in secure connector storage.</p>{error&&<p className="text-sm text-destructive mb-3">{error}</p>}<Button onClick={connect}>Connect GitHub</Button></div>;
 return <div className="space-y-4"><div className="flex justify-between items-center"><p className="text-sm text-primary font-semibold">GitHub connected</p><Button variant="ghost" size="sm" onClick={disconnect}>Disconnect</Button></div><div><Label>Repository</Label><Select value={value.github_owner?`${value.github_owner}/${value.github_repository}`:""} onValueChange={pickRepo}><SelectTrigger><SelectValue placeholder="Select a repository"/></SelectTrigger><SelectContent>{repos.map(r=><SelectItem key={r.id} value={r.full_name}>{r.full_name}{r.private?" · Private":""}</SelectItem>)}</SelectContent></Select></div>{value.github_repository&&<div><Label>Branch</Label><Select value={value.github_branch} onValueChange={github_branch=>onChange({...value,github_branch})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{branches.map(b=><SelectItem key={b.sha} value={b.name}>{b.name}</SelectItem>)}</SelectContent></Select></div>}</div>;
}