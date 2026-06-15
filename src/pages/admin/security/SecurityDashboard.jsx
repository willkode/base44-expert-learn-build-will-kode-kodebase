import React, { useState, useEffect, useCallback } from "react";
import { Route as RouteIcon, Boxes, Users, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { trackEvent } from "@/lib/analytics";
import { runRegistryScan, SCAN_DISCLAIMER } from "@/components/admin/security/scanEngine";
import { retestOpenIssues } from "@/components/admin/security/issues/issueActions";
import OverviewTab from "@/components/admin/security/tabs/OverviewTab";
import IssuesTab from "@/components/admin/security/tabs/IssuesTab";
import ScanHistoryTab from "@/components/admin/security/tabs/ScanHistoryTab";
import RegistryManager from "@/components/admin/security/registry/RegistryManager";
import RegistrySetupToolbar from "@/components/admin/security/registry/RegistrySetupToolbar";
import SettingsTab from "@/components/admin/security/tabs/SettingsTab";
import ReportTab from "@/components/admin/security/tabs/ReportTab";

const OPEN_STATUSES = ["Open", "In Progress", "Needs Retest"];

export default function SecurityDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [retesting, setRetesting] = useState(false);
  const [scanState, setScanState] = useState("ready"); // ready | running | complete | failed
  const [scans, setScans] = useState([]);
  const [issues, setIssues] = useState([]);
  const [registry, setRegistry] = useState([]);
  const [setting, setSetting] = useState(null);

  const load = useCallback(async () => {
    const [scanList, issueList, registryList, settingList] = await Promise.all([
      base44.entities.SecurityScan.list("-created_date", 100),
      base44.entities.SecurityIssue.list("-created_date", 200),
      base44.entities.SecurityRegistry.list("-created_date", 200),
      base44.entities.SecuritySetting.filter({ setting_id: "global" }),
    ]);
    setScans(scanList);
    setIssues(issueList);
    setRegistry(registryList);
    setSetting(settingList[0] || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    trackEvent("view_admin_security", { page_path: "/admin/security" });
    load();
  }, [load]);

  const latestScan = scans.find((s) => s.status === "Completed" || s.status === "Needs Review") || scans[0] || null;

  const counts = {
    open: issues.filter((i) => OPEN_STATUSES.includes(i.status)).length,
    critical: issues.filter((i) => i.severity === "Critical" && OPEN_STATUSES.includes(i.status)).length,
    high: issues.filter((i) => i.severity === "High" && OPEN_STATUSES.includes(i.status)).length,
    medium: issues.filter((i) => i.severity === "Medium" && OPEN_STATUSES.includes(i.status)).length,
    low: issues.filter((i) => i.severity === "Low" && OPEN_STATUSES.includes(i.status)).length,
    fixed: issues.filter((i) => i.status === "Fixed").length,
    needsRetest: issues.filter((i) => i.status === "Needs Retest").length,
  };

  const handleScanNow = async () => {
    setScanning(true);
    setScanState("running");
    trackEvent("security_scan_started", { scan_type: "Manual" });
    const me = await base44.auth.me();
    const startedAt = new Date().toISOString();

    // 1. Create a Running scan record.
    const scan = await base44.entities.SecurityScan.create({
      scan_id: `scan_${Date.now()}`,
      started_at: startedAt,
      started_by: me?.email || "admin",
      status: "Running",
      scan_type: "Manual",
    });

    try {
      // 2. Analyze the registry → checks + issues + score.
      const registryList = await base44.entities.SecurityRegistry.list("-created_date", 500);
      const { checks, issues, score, label, counts } = runRegistryScan(registryList);

      // 3. Persist checks and issues linked to this scan.
      if (checks.length > 0) {
        await base44.entities.SecurityCheck.bulkCreate(
          checks.map((c) => ({ ...c, scan_id: scan.id, check_id: `chk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` }))
        );
      }
      if (issues.length > 0) {
        await base44.entities.SecurityIssue.bulkCreate(issues.map((i) => ({ ...i, scan_id: scan.id })));
      }

      const passed = checks.filter((c) => c.status === "Passed").length;
      const failed = checks.filter((c) => c.status === "Failed").length;

      // 4. Mark the scan Completed with score + summary.
      await base44.entities.SecurityScan.update(scan.id, {
        status: "Completed",
        completed_at: new Date().toISOString(),
        overall_score: score,
        critical_count: counts.critical,
        high_count: counts.high,
        medium_count: counts.medium,
        low_count: counts.low,
        total_checks: checks.length,
        passed_checks: passed,
        failed_checks: failed,
        summary: `Security score: ${score}/100 (${label}). ${issues.length} issue${issues.length === 1 ? "" : "s"} across ${checks.length} checks. ${SCAN_DISCLAIMER}`,
      });

      if (setting?.id) {
        await base44.entities.SecuritySetting.update(setting.id, { last_scan_at: startedAt });
      }

      trackEvent("security_scan_completed", { score, issues: issues.length });
      await load();
      setScanState("complete");
      toast({ title: "Scan complete", description: `Score ${score}/100 — ${label}. ${issues.length} issue${issues.length === 1 ? "" : "s"} found.` });
    } catch (err) {
      await base44.entities.SecurityScan.update(scan.id, {
        status: "Failed",
        completed_at: new Date().toISOString(),
        summary: `Scan failed: ${err.message}`,
      });
      await load();
      setScanState("failed");
      toast({ title: "Scan failed", description: err.message, variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const handleRetestOpen = async () => {
    if (counts.open === 0) {
      toast({ title: "Nothing to retest", description: "There are no open, in-progress, or needs-retest issues." });
      return;
    }
    setRetesting(true);
    trackEvent("security_retest_open_started", { open: counts.open });
    try {
      const res = await retestOpenIssues(issues);
      await load();
      trackEvent("security_retest_open_completed", { passed: res.passed, failed: res.failed, score: res.score });
      toast({ title: "Retest complete", description: `${res.tested} retested — ${res.passed} passed, ${res.failed} still failing. Score ${res.score}/100.` });
    } catch (err) {
      toast({ title: "Retest failed", description: err.message, variant: "destructive" });
    } finally {
      setRetesting(false);
    }
  };

  if (loading) return <LoadingState label="Loading security dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-1 py-2">
      <PageHeader
        title="Security Lockdown Pro"
        description="Admin-only security monitoring across your app's routes, entities, and roles."
      />

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab
            scans={scans}
            issues={issues}
            latestScan={latestScan}
            counts={counts}
            onScanNow={handleScanNow}
            scanning={scanning}
            scanState={scanState}
            onRetestOpen={handleRetestOpen}
            retesting={retesting}
          />
        </TabsContent>

        <TabsContent value="setup">
          <RegistrySetupToolbar items={registry} onChanged={load} />
        </TabsContent>

        <TabsContent value="issues">
          <IssuesTab issues={issues} scans={scans} onChanged={load} />
        </TabsContent>

        <TabsContent value="history">
          <ScanHistoryTab scans={scans} />
        </TabsContent>

        <TabsContent value="routes">
          <RegistryManager
            items={registry}
            itemType="Route"
            icon={RouteIcon}
            emptyTitle="No routes registered"
            emptyDescription="Add the routes the scanner should evaluate, or auto-generate a starter set from the Setup tab."
            onChanged={load}
          />
        </TabsContent>

        <TabsContent value="entities">
          <RegistryManager
            items={registry}
            itemType="Entity"
            icon={Boxes}
            emptyTitle="No entities registered"
            emptyDescription="Add the entities the scanner should evaluate for data exposure, or auto-generate a starter set from the Setup tab."
            onChanged={load}
          />
        </TabsContent>

        <TabsContent value="roles">
          <RegistryManager
            items={registry}
            itemType="Role"
            icon={Users}
            emptyTitle="No roles registered"
            emptyDescription="Add the roles the scanner should evaluate for access control, or auto-generate a starter set from the Setup tab."
            onChanged={load}
          />
        </TabsContent>

        <TabsContent value="actions">
          <RegistryManager
            items={registry}
            itemType="Action"
            icon={Zap}
            emptyTitle="No actions registered"
            emptyDescription="Add sensitive features and dangerous actions the scanner should evaluate, or auto-generate a starter set from the Setup tab."
            onChanged={load}
          />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab setting={setting} onSaved={load} />
        </TabsContent>

        <TabsContent value="report">
          <ReportTab latestScan={latestScan} issues={issues} scans={scans} registry={registry} counts={counts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}