import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

const RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
  { value: "all", label: "All time" },
];

const ALL = "__all__";

// Shared filter bar for the analytics dashboard.
export default function AnalyticsFilters({ filters, setFilters, categories, tags, authors }) {
  const update = (k, v) => setFilters((f) => ({ ...f, [k]: v === ALL ? "" : v }));

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div>
        <Label className="text-xs mb-1.5 block">Date range</Label>
        <Select value={filters.range} onValueChange={(v) => update("range", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs mb-1.5 block">Category</Label>
        <Select value={filters.category || ALL} onValueChange={(v) => update("category", v)}>
          <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs mb-1.5 block">Tag</Label>
        <Select value={filters.tag || ALL} onValueChange={(v) => update("tag", v)}>
          <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All tags</SelectItem>
            {tags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs mb-1.5 block">Author</Label>
        <Select value={filters.author || ALL} onValueChange={(v) => update("author", v)}>
          <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All authors</SelectItem>
            {authors.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs mb-1.5 block">Status</Label>
        <Select value={filters.status || ALL} onValueChange={(v) => update("status", v)}>
          <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs mb-1.5 block">Traffic source</Label>
        <Select value={filters.source || ALL} onValueChange={(v) => update("source", v)}>
          <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All sources</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="search">Search</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}