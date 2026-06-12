import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["subscribed", "unsubscribed", "bounced", "complained", "suppressed", "pending"];
const ACTIVITY = [
  ["any", "Any activity"],
  ["opened", "Has opened"],
  ["clicked", "Has clicked"],
  ["never_opened", "Never opened"],
];

export default function ContactFilters({ filters, setFilters, allTags, allSources, lists }) {
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      <Input
        placeholder="Search email, name, company..."
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        className="max-w-xs"
      />
      <Select value={filters.status} onValueChange={(v) => set("status", v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.tag} onValueChange={(v) => set("tag", v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Tag" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tags</SelectItem>
          {allTags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.source} onValueChange={(v) => set("source", v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Source" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          {allSources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.list} onValueChange={(v) => set("list", v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="List" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All lists</SelectItem>
          {(lists || []).map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.activity} onValueChange={(v) => set("activity", v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Activity" /></SelectTrigger>
        <SelectContent>
          {ACTIVITY.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}