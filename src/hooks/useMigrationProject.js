import { useCallback,useEffect,useState } from "react";
import { base44 } from "@/api/base44Client";
export default function useMigrationProject(projectId,poll=false){
 const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const refresh=useCallback(async()=>{try{const r=await base44.functions.invoke("getMigrationReport",{project_id:projectId});setData(r.data);setError("")}catch(e){setError(e.response?.data?.error||e.message)}setLoading(false)},[projectId]);
 useEffect(()=>{refresh();if(!poll)return;const t=setInterval(refresh,3000);return()=>clearInterval(t)},[refresh,poll]);
 return{data,loading,error,refresh,setData};
}