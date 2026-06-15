import React, { useState, useEffect, useCallback } from "react";
import { Route as RouteIcon, Boxes, Users, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { trackEvent } from "@/lib/analytics";
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
    trackEvent("security_scan_started", { scan_type: "Manual" });
    const me = await base44.auth.me();
    const startedAt = new Date().toISOString();
    await base44.entities.SecurityScan.create({
      scan_id: `scan_${Date.now()}`,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      started_by: me?.email || "admin",
      status: "Needs Review",
      scan_type: "Manual",
      total_checks: 0,
      passed_checks: 0,
      failed_checks: 0,
      summary: "Scan recorded. The scanning engine will populate checks and issues.",
    });
    if (setting?.id) {
      await base44.entities.SecuritySetting.update(setting.id, { last_scan_at: startedAt });
    }
    await load();
    setScanning(false);
    toast({ title: "Scan recorded", description: "A new security scan run was created." });
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
          />
        </TabsContent>

        <TabsContent value="setup">
          <RegistrySetupToolbar items={registry} onChanged={load} />
        </TabsContent>

        <TabsContent value="issues">
          <IssuesTab issues={issues} />
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
    </div>
  );
}