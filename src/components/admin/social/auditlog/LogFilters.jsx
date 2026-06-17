import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PLATFORMS } from "@/components/admin/social/socialConfig";
import { EVENT_GROUPS, STATUS_OPTIONS, DATE_RANGE_OPTIONS } from "./logsConfig";

export default function LogFilters({ filters, setFilters, campaigns, users, onReset }) {
  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Date range */}
        <Select value={filters.dateRange} onValueChange={(v) => update("dateRange", v)}>
          <SelectTrigger><SelectValue placeholder="Date range" /></SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((o) => (
              <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Event type (grouped) */}
        <Select value={filters.eventType} onValueChange={(v) => update("eventType", v)}>
          <SelectTrigger><SelectValue placeholder="Event type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {EVENT_GROUPS.map((g) => (
              <SelectItem key={g.label} value={`group:${g.label}`}>{g.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Platform */}
        <Select value={filters.platform} onValueChange={(v) => update("platform", v)}>
          <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {PLATFORMS.map((p) => (
              <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={filters.status} onValueChange={(v) => update("status", v)}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Campaign */}
        <Select value={filters.campaign} onValueChange={(v) => update("campaign", v)}>
          <SelectTrigger><SelectValue placeholder="Campaign" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            {campaigns.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* User */}
        <Select value={filters.user} onValueChange={(v) => update("user", v)}>
          <SelectTrigger><SelectValue placeholder="User" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.full_name || u.email || u.id}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            placeholder="Search messages…"
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <X className="w-3.5 h-3.5 mr-1.5" /> Reset
        </Button>
      </div>
    </div>
  );
}