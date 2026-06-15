import React, { useState, useEffect, useCallback } from "react";
import { Route as RouteIcon, Boxes, Users, Zap, ShieldAlert, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";
import { runRegistryScan, SCAN_DISCLAIMER } from "@/components/admin/security/scanEngine";
import { runEmergencyReview } from "@/components/admin/security/emergencyEngine";
import EmergencyLockdownSummary from "@/components/admin/security/emergency/EmergencyLockdownSummary";
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
  const [scanState, setScanState] = useState("ready"); // ready | running | complete | failed
  const [scans, setScans] = useState([]);
  const [issues, setIssues] = useState([]);
  const [registry, setRegistry] = useState([]);
  const [setting, setSetting] = useState(null);
  const [emergencyRunning, setEmergencyRunning] = useState(false);
  const [emergencyResult, setEmergencyResult] = useState(null);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

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

  const handleEmergencyReview = async () => {
    setEmergencyRunning(true);
    trackEvent("security_emergency_review_started", {});
    const me = await base44.auth.me();
    const startedAt = new Date().toISOString();

    // 1. Create a Manual scan record for the emergency review.
    const scan = await base44.entities.SecurityScan.create({
      scan_id: `emrg_${Date.now()}`,
      started_at: startedAt,
      started_by: me?.email || "admin",
      status: "Running",
      scan_type: "Manual",
    });

    try {
      // 2. Run the urgent-focused review against the registry.
      const registryList = await base44.entities.SecurityRegistry.list("-created_date", 500);
      const result = runEmergencyReview(registryList);
      const { checks, urgentIssues, score, summary } = result;

      // 3. Persist checks and the urgent issues found.
      if (checks.length > 0) {
        await base44.entities.SecurityCheck.bulkCreate(
          checks.map((c) => ({ ...c, scan_id: scan.id, check_id: `chk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` }))
        );
      }
      if (urgentIssues.length > 0) {
        await base44.entities.SecurityIssue.bulkCreate(urgentIssues.map((i) => ({ ...i, scan_id: scan.id })));
      }

      const passed = checks.filter((c) => c.status === "Passed").length;
      const failed = checks.filter((c) => c.status === "Failed").length;

      // 4. Mark the scan Completed with an emergency summary.
      await base44.entities.SecurityScan.update(scan.id, {
        status: "Completed",
        completed_at: new Date().toISOString(),
        overall_score: score,
        critical_count: summary.criticalCount,
        high_count: summary.highCount,
        total_checks: checks.length,
        passed_checks: passed,
        failed_checks: failed,
        summary: `Emergency Lockdown Review: ${summary.criticalCount} critical, ${summary.highCount} high, ${summary.totalUrgent} urgent issue${summary.totalUrgent === 1 ? "" : "s"}. Score ${score}/100. ${SCAN_DISCLAIMER}`,
      });

      trackEvent("security_emergency_review_completed", { critical: summary.criticalCount, high: summary.highCount });
      setEmergencyResult(result);
      setEmergencyOpen(true);
      await load();
      toast({ title: "Emergency review complete", description: `${summary.totalUrgent} urgent issue${summary.totalUrgent === 1 ? "" : "s"} found.` });
    } catch (err) {
      await base44.entities.SecurityScan.update(scan.id, {
        status: "Failed",
        completed_at: new Date().toISOString(),
        summary: `Emergency review failed: ${err.message}`,
      });
      await load();
      toast({ title: "Emergency review failed", description: err.message, variant: "destructive" });
    } finally {
      setEmergencyRunning(false);
    }
  };

  if (loading) return <LoadingState label="Loading security dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-1 py-2">
      <PageHeader
        title="Security Lockdown Pro"
        description="Admin-only security monitoring across your app's routes, entities, and roles."
      />

      {/* Emergency Lockdown Review */}
      <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="font-sora font-semibold">Emergency Lockdown Review</p>
            <p className="text-sm text-muted-foreground max-w-xl">
              Believe private data or admin tools may be exposed? Run an urgent review of high-risk routes, entities, and roles, and get emergency fix prompts to copy.
            </p>
          </div>
        </div>
        <button
          onClick={handleEmergencyReview}
          disabled={emergencyRunning}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white disabled:opacity-80 transition-colors shrink-0"
        >
          {emergencyRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
          {emergencyRunning ? "Reviewing..." : "Emergency Lockdown Review"}
        </button>
      </div>

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
          <ReportTab latestScan={latestScan} issues={issues} counts={counts} />
        </TabsContent>
      </Tabs>

      <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-sora">
              <ShieldAlert className="w-5 h-5 text-red-400" /> Emergency Lockdown Summary
            </DialogTitle>
          </DialogHeader>
          {emergencyResult && (
            <EmergencyLockdownSummary result={emergencyResult} onClose={() => setEmergencyOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}