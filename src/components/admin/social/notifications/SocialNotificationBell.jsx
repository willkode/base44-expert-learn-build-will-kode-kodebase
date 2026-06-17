import React, { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SOCIAL_SEVERITY_STYLES, SOCIAL_EVENT_META, eventIcon, formatNotifDate } from "./notificationConfig";

// Admin notification bell + dropdown panel for the social marketing module.
export default function SocialNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const load = () =>
    base44.entities.SocialNotification.list("-created_date", 50).then(setNotifications).catch(() => {});

  useEffect(() => {
    load();
    const unsub = base44.entities.SocialNotification.subscribe(() => load());
    return () => { try { unsub(); } catch (_e) { /* */ } };
  }, []);

  const unread = notifications.filter((n) => !n.read);

  const markRead = async (n) => {
    if (n.read) return;
    await base44.entities.SocialNotification.update(n.id, { read: true });
    load();
  };
  const markAllRead = async () => {
    await Promise.all(unread.map((n) => base44.entities.SocialNotification.update(n.id, { read: true })));
    load();
  };
  const clearAll = async () => {
    await Promise.all(notifications.map((n) => base44.entities.SocialNotification.delete(n.id)));
    load();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/70 hover:bg-secondary transition-colors">
        <Bell className="w-4.5 h-4.5 text-muted-foreground" />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="font-sora font-semibold text-sm">Social Alerts</p>
          <div className="flex items-center gap-1">
            {unread.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={markAllRead}>
                <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={clearAll} title="Clear all">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Automation events will show up here.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = eventIcon(n.event_type);
              const label = SOCIAL_EVENT_META[n.event_type]?.label;
              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n)}
                  className={`w-full text-left px-4 py-3 border-b border-border/60 hover:bg-secondary/50 transition-colors ${n.read ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-2.5">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                    <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate flex-1">{n.title}</p>
                        {n.severity && n.severity !== "info" && (
                          <Badge variant="outline" className={`text-[10px] ${SOCIAL_SEVERITY_STYLES[n.severity] || ""}`}>{label || n.severity}</Badge>
                        )}
                      </div>
                      {n.message && <p className="text-xs text-muted-foreground">{n.message}</p>}
                      <p className="text-[11px] text-muted-foreground/70 mt-1">{formatNotifDate(n.created_date)}</p>
                    </div>
                    {n.read && <Check className="w-3.5 h-3.5 text-muted-foreground mt-1 shrink-0" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}