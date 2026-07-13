import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
export default function ZipUploader({value,onChange}){
 const [loading,setLoading]=useState(false),[error,setError]=useState("");
 const upload=async e=>{const file=e.target.files?.[0];if(!file)return;if(!file.name.toLowerCase().endsWith(".zip")){setError("Choose an exported ZIP file.");return}setLoading(true);setError("");try{const r=await base44.integrations.Core.UploadPrivateFile({file});onChange({zip_file_uri:r.file_uri,zip_name:file.name})}catch(err){setError(err.message||"Upload failed.")}setLoading(false)};
 return <label className="block rounded-xl border border-dashed border-border p-6 text-center cursor-pointer hover:border-primary/50"><input className="sr-only" type="file" accept=".zip,application/zip" onChange={upload}/>{loading?<Loader2 className="w-6 h-6 animate-spin mx-auto text-primary"/>:<Upload className="w-6 h-6 mx-auto text-primary"/>}<p className="font-semibold mt-2">{value.zip_name||"Upload exported ZIP"}</p><p className="text-xs text-muted-foreground mt-1">Stored privately and used only for your assessment.</p>{error&&<p className="text-xs text-destructive mt-2">{error}</p>}</label>;
}