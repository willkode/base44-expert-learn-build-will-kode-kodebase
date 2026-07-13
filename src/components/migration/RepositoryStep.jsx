import { useState } from "react";
import { Button } from "@/components/ui/button";
import GithubPicker from "@/components/migration/GithubPicker";
import ZipUploader from "@/components/migration/ZipUploader";
export default function RepositoryStep({value,onChange}){
 const [mode,setMode]=useState(value.repository_source||"github");
 const choose=m=>{setMode(m);onChange({repository_source:m})};
 return <div className="space-y-5"><div><h2 className="font-sora text-2xl font-bold">Connect your source</h2><p className="text-sm text-muted-foreground mt-1">GitHub is recommended. An authorized ZIP is available as a fallback.</p></div><div className="flex gap-2"><Button type="button" variant={mode==="github"?"default":"outline"} onClick={()=>choose("github")}>GitHub</Button><Button type="button" variant={mode==="zip"?"default":"outline"} onClick={()=>choose("zip")}>ZIP upload</Button></div>{mode==="github"?<GithubPicker value={value} onChange={v=>onChange({...v,repository_source:"github"})}/>:<ZipUploader value={value} onChange={v=>onChange({...v,repository_source:"zip"})}/>}</div>;
}