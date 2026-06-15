import React, { useState } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import SecurityBadge from "@/components/admin/security/SecurityBadge";
import { SEVERITY_STYLES, formatDate } from "@/components/admin/security/securityConfig";

// Admin notification bell + dropdown panel for Security Lockdown Pro.
export default function NotificationBell({ notifications = [], onChanged }) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read);

  const markRead = async (n) => {
    if (n.read) return;
    await base44.entities.SecurityNotification.update(n.id, { read: true });
    onChanged?.();
  };

  const markAllRead = async () => {
    await Promise.all(unread.map((n) => base44.entities.SecurityNotification.update(n.id, { read: true })));
    onChanged?.();
  };

  const clearAll = async () => {
    await Promise.all(notifications.map((n) => base44.entities.SecurityNotification.delete(n.id)));
    onChanged?.();
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
          <p className="font-sora font-semibold text-sm">Security Alerts</p>
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
              <p className="text-xs text-muted-foreground mt-1">Run a scan to start receiving security alerts.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n)}
                className={`w-full text-left px-4 py-3 border-b border-border/60 hover:bg-secondary/50 transition-colors ${n.read ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate flex-1">{n.title}</p>
                      {n.severity && n.severity !== "Info" && (
                        <SecurityBadge label={n.severity} styleMap={SEVERITY_STYLES} />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">{formatDate(n.created_date)}</p>
                  </div>
                  {n.read && <Check className="w-3.5 h-3.5 text-muted-foreground mt-1 shrink-0" />}
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}