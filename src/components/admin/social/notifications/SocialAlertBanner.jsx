import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { SOCIAL_SEVERITY_STYLES, eventIcon } from "./notificationConfig";

// Inline contextual alert banner that surfaces recent unread notifications
// matching a set of event types, on a specific page.
// Props: events (array of event_type), title, max (default 4), dismissible (default true).
export default function SocialAlertBanner({ events = [], title, max = 4, dismissible = true }) {
  const [items, setItems] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  const load = () =>
    base44.entities.SocialNotification.filter({ read: false }, "-created_date", 50)
      .then((all) => setItems(all.filter((n) => events.includes(n.event_type))))
      .catch(() => {});

  useEffect(() => {
    load();
    const unsub = base44.entities.SocialNotification.subscribe(() => load());
    return () => { try { unsub(); } catch (_e) { /* */ } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.join(",")]);

  const visible = items.filter((n) => !dismissed.includes(n.id));
  if (visible.length === 0) return null;

  const dismiss = async (n) => {
    setDismissed((d) => [...d, n.id]);
    await base44.entities.SocialNotification.update(n.id, { read: true }).catch(() => {});
  };

  return (
    <div className="space-y-2 mb-5">
      {title && <p className="text-sm font-medium text-muted-foreground">{title}</p>}
      {visible.slice(0, max).map((n) => {
        const Icon = eventIcon(n.event_type);
        return (
          <div key={n.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${SOCIAL_SEVERITY_STYLES[n.severity] || SOCIAL_SEVERITY_STYLES.info}`}>
            <Icon className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{n.title}</p>
              {n.message && <p className="text-xs opacity-90 mt-0.5">{n.message}</p>}
            </div>
            {dismissible && (
              <button onClick={() => dismiss(n)} className="opacity-70 hover:opacity-100 shrink-0" title="Dismiss">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}