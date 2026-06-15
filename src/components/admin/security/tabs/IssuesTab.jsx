import React, { useState, useMemo } from "react";
import { ShieldCheck, Search, Route as RouteIcon, Database, RefreshCw } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import SecurityBadge from "@/components/admin/security/SecurityBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { SEVERITY_STYLES, ISSUE_STATUS_STYLES, SEVERITY_ORDER, formatDate } from "@/components/admin/security/securityConfig";
import IssueRowActions from "@/components/admin/security/issues/IssueRowActions";
import IssueDetailDrawer from "@/components/admin/security/issues/IssueDetailDrawer";
import { retestOpenIssues } from "@/components/admin/security/issues/issueActions";

const OPEN_RETEST_STATUSES = ["Open", "In Progress", "Needs Retest"];

const STATUS_OPTIONS = ["All", "Open", "In Progress", "Fixed", "Needs Retest", "Ignored", "False Positive"];
const SEVERITY_OPTIONS = ["All", ...SEVERITY_ORDER];
const CATEGORY_OPTIONS = [
  "All", "Route Protection", "Admin Lockdown", "Entity Exposure", "Public Data Leak",
  "User Data Isolation", "Role-Based Access", "Dangerous Action", "Premium Access", "Configuration", "General",
];

export default function IssuesTab({ issues, scans = [], onChanged }) {
  const { toast } = useToast();
  const [retesting, setRetesting] = useState(false);
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [scanId, setScanId] = useState("All");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openIssue = (issue) => { setActive(issue); setDrawerOpen(true); };

  const openCount = issues.filter((i) => OPEN_RETEST_STATUSES.includes(i.status)).length;

  const handleRetestOpen = async () => {
    if (openCount === 0) {
      toast({ title: "Nothing to retest", description: "There are no open, in-progress, or needs-retest issues." });
      return;
    }
    setRetesting(true);
    try {
      const res = await retestOpenIssues(issues);
      onChanged?.();
      toast({ title: "Retest complete", description: `${res.tested} retested — ${res.passed} passed, ${res.failed} still failing. Score ${res.score}/100.` });
    } finally {
      setRetesting(false);
    }
  };

  // Keep the drawer's data fresh after a refresh.
  const activeIssue = active ? issues.find((i) => i.id === active.id) || active : null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return issues
      .filter((i) => severity === "All" || i.severity === severity)
      .filter((i) => status === "All" || i.status === status)
      .filter((i) => category === "All" || i.category === category)
      .filter((i) => scanId === "All" || i.scan_id === scanId)
      .filter((i) => {
        if (!q) return true;
        return [i.title, i.location, i.affected_entity, i.affected_route, i.affected_role]
          .filter(Boolean).some((v) => v.toLowerCase().includes(q));
      })
      .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
  }, [issues, severity, status, category, scanId, search]);

  if (issues.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No security issues yet"
        description="Once you run a scan, any issues found will be listed here with severity, location, and a recommended fix."
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search title, location, entity, route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>{SEVERITY_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>{CATEGORY_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={scanId} onValueChange={setScanId}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Scan" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All scans</SelectItem>
            {scans.map((s) => <SelectItem key={s.id} value={s.id}>{s.scan_type} · {formatDate(s.completed_at || s.started_at)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{filtered.length} of {issues.length} issues</span>
        <Button variant="outline" size="sm" onClick={handleRetestOpen} disabled={retesting} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${retesting ? "animate-spin" : ""}`} />
          {retesting ? "Retesting..." : `Retest Open Issues (${openCount})`}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No issues match these filters" description="Try adjusting the filters or search." />
      ) : (
        <div className="rounded-xl border border-border bg-card/70 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((issue) => (
                <TableRow key={issue.id} className="cursor-pointer" onClick={() => openIssue(issue)}>
                  <TableCell><SecurityBadge label={issue.severity} styleMap={SEVERITY_STYLES} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{issue.category}</TableCell>
                  <TableCell className="max-w-[280px]">
                    <p className="font-medium text-sm truncate">{issue.title || "Untitled issue"}</p>
                    {issue.location && <p className="text-xs text-muted-foreground truncate">{issue.location}</p>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {issue.affected_route && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary"><RouteIcon className="w-3 h-3" />{issue.affected_route}</span>
                      )}
                      {issue.affected_entity && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400"><Database className="w-3 h-3" />{issue.affected_entity}</span>
                      )}
                      {issue.affected_role && (
                        <span className="text-xs text-muted-foreground">Role · {issue.affected_role}</span>
                      )}
                      {!issue.affected_route && !issue.affected_entity && !issue.affected_role && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell><SecurityBadge label={issue.status} styleMap={ISSUE_STATUS_STYLES} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(issue.created_date)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <IssueRowActions issue={issue} onView={openIssue} onChanged={onChanged} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <IssueDetailDrawer
        issue={activeIssue}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onChanged={onChanged}
      />
    </div>
  );
}