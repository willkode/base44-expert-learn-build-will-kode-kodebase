import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, AlertCircle, RefreshCw, Pencil, CalendarClock, ScrollText,
  Plug, Facebook, Instagram, CheckSquare, PlayCircle, LifeBuoy, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveSocialError, ERROR_ACTIONS } from "./socialErrorCatalog";

const ACTION_ICON = {
  reconnect: Plug,
  retry: RefreshCw,
  edit: Pencil,
  reschedule: CalendarClock,
  viewLogs: ScrollText,
  connectFacebookPage: Facebook,
  connectInstagram: Instagram,
  approve: CheckSquare,
  resumeCampaign: PlayCircle,
  support: LifeBuoy,
};

// SocialErrorCard renders a user-friendly error with recovery action buttons.
//
// Props:
//  - code:            raw error code (e.g. "facebook_page_token_expired")
//  - message:         optional fallback/raw message used for unknown codes
//  - platform:        optional platform label shown in the header
//  - busy:            optional action key currently in-flight (shows spinner)
//  - onAction:        (actionKey) => void | Promise — for in-app handlers
//                     (retry, reschedule, edit, resumeCampaign). Navigation
//                     actions (reconnect, viewLogs, support, connect*) route
//                     automatically unless a handler returns true (handled).
//  - hideActions:     array of action keys to suppress in this context
//  - compact:         tighter layout for inline placement
export default function SocialErrorCard({
  code, message, platform, busy, onAction, hideActions = [], compact = false,
}) {
  const navigate = useNavigate();
  const err = resolveSocialError(code, message);
  const isWarning = err.severity === "warning";
  const Icon = isWarning ? AlertTriangle : AlertCircle;

  const tone = isWarning
    ? "border-amber-500/30 bg-amber-500/10"
    : "border-red-500/30 bg-red-500/10";
  const iconTone = isWarning ? "text-amber-400" : "text-red-400";

  const handle = async (key) => {
    const def = ERROR_ACTIONS[key];
    // Let the parent handle in-app actions first; if it returns true, it's done.
    if (onAction) {
      const handled = await onAction(key, err);
      if (handled === true) return;
    }
    if (def?.to) navigate(def.to);
  };

  const actions = (err.actions || []).filter((a) => !hideActions.includes(a) && ERROR_ACTIONS[a]);

  return (
    <div className={`rounded-xl border ${tone} ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconTone}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-sora font-semibold text-sm">{err.title}</h4>
            {platform && (
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                {platform}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/90 mt-1">{err.happened}</p>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="font-medium text-foreground/80">What to do: </span>{err.nextStep}
          </p>

          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {actions.map((key, i) => {
                const def = ERROR_ACTIONS[key];
                const ActIcon = ACTION_ICON[key] || RefreshCw;
                const isBusy = busy === key;
                return (
                  <Button
                    key={key}
                    size="sm"
                    variant={i === 0 ? "default" : "outline"}
                    disabled={isBusy}
                    onClick={() => handle(key)}
                  >
                    {isBusy ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <ActIcon className="w-3.5 h-3.5 mr-1.5" />}
                    {def.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}