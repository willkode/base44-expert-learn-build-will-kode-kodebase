import { Checkbox } from "@/components/ui/checkbox";
const items=[
 ["ownership","I own this repository or have authorization from the repository owner."],
 ["sourceOnly","I understand that this service analyzes exported source code and does not access the Base44 editor."],
 ["authorizedData","I agree not to submit repositories, data, or code that I am not authorized to analyze."],
];
export default function AuthorizationStep({value,onChange}){return <div className="space-y-4"><div><h2 className="font-sora text-2xl font-bold">Confirm authorization</h2><p className="text-sm text-muted-foreground mt-1">All confirmations are required before repository access.</p></div>{items.map(([key,label])=><label key={key} className="flex gap-3 rounded-xl border border-border p-4 cursor-pointer"><Checkbox checked={!!value[key]} onCheckedChange={v=>onChange({...value,[key]:!!v})}/><span className="text-sm leading-relaxed">{label}</span></label>)}</div>;}