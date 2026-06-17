import React from "react";
import { CheckCircle2, AlertTriangle, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SECRETS_CHECKLIST } from "./socialSetupConfig";

export default function SocialSecretsChecklist({ secrets }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-3">
        Admin-only setup status — secret values are never shown here. Add credentials in app secrets and each platform's developer portal.
      </p>
      {SECRETS_CHECKLIST.map((item) => {
        const ok = !!secrets[item.key];
        const Icon = ok ? CheckCircle2 : item.required ? AlertTriangle : MinusCircle;
        const color = ok ? "text-emerald-500" : item.required ? "text-amber-500" : "text-muted-foreground";
        return (
          <div key={item.key} className="flex items-start gap-3 rounded-xl border border-border bg-card/40 p-3.5">
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${color}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium">{item.label}</p>
                {item.managed && <Badge variant="secondary" className="text-[10px]">Built-in</Badge>}
                {!item.required && !item.managed && <Badge variant="outline" className="text-[10px]">Per platform</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
            </div>
            <span className={`text-xs font-medium shrink-0 ${color}`}>
              {ok ? "Ready" : item.required ? "Action needed" : "When used"}
            </span>
          </div>
        );
      })}
    </div>
  );
}