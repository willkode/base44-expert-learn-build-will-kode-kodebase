import React from "react";
import { PLATFORMS } from "@/components/admin/social/socialConfig";
import { DATE_RANGES, CONTENT_TYPES } from "./analyticsConfig";

const STATUSES = [
  { key: "all", label: "All statuses" },
  { key: "published", label: "Published" },
  { key: "failed", label: "Failed" },
  { key: "queued", label: "Upcoming" },
];

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
    >
      {children}
    </select>
  );
}

export default function AnalyticsFilters({ filters, setFilters, campaigns = [], accounts = [], show = {} }) {
  const set = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }));
  return (
    <div className="flex flex-wrap gap-3">
      <Select value={filters.range} onChange={set("range")}>
        {DATE_RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
      </Select>

      {show.platform !== false && (
        <Select value={filters.platform} onChange={set("platform")}>
          <option value="all">All platforms</option>
          {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </Select>
      )}

      {show.campaign !== false && (
        <Select value={filters.campaign} onChange={set("campaign")}>
          <option value="all">All campaigns</option>
          {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      )}

      {show.status && (
        <Select value={filters.status} onChange={set("status")}>
          {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </Select>
      )}

      {show.account && (
        <Select value={filters.account} onChange={set("account")}>
          <option value="all">All accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.platform_display_name || a.platform_username || a.platform}
            </option>
          ))}
        </Select>
      )}

      {show.contentType && (
        <Select value={filters.contentType} onChange={set("contentType")}>
          {CONTENT_TYPES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </Select>
      )}
    </div>
  );
}