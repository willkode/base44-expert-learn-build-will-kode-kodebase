import React, { useState, useMemo } from "react";
import { FileText, Sparkles, Copy, Check, Printer } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { trackEvent } from "@/lib/analytics";
import { formatDate } from "@/components/admin/security/securityConfig";
import { buildReportModel, reportToPlainText } from "@/components/admin/security/report/reportBuilder";
import { printReport } from "@/components/admin/security/report/printReport";
import { copyToClipboard } from "@/components/admin/security/issues/issueActions";
import ReportDocument from "@/components/admin/security/report/ReportDocument";

export default function ReportTab({ latestScan, issues, scans = [], registry = [] }) {
  const { toast } = useToast();
  // Scans worth reporting on (completed or needs review), latest first.
  const reportableScans = useMemo(
    () => scans.filter((s) => s.status === "Completed" || s.status === "Needs Review"),
    [scans]
  );

  const defaultScanId = latestScan?.id || reportableScans[0]?.id || "";
  const [scanId, setScanId] = useState(defaultScanId);
  const [model, setModel] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  if (reportableScans.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No report available"
        description="Run a security scan first. Once a scan completes, you can generate a client-ready audit report here."
      />
    );
  }

  const selectedScan = scans.find((s) => s.id === scanId) || null;

  const handleGenerate = () => {
    if (!selectedScan) {
      toast({ title: "Select a scan", description: "Choose a completed scan to generate a report.", variant: "destructive" });
      return;
    }
    const m = buildReportModel(selectedScan, issues, registry);
    setModel(m);
    setShowFallback(false);
    trackEvent("security_report_generated", { scan_id: selectedScan.id, score: m.score });
    toast({ title: "Report generated", description: `Audit report ready — score ${m.score != null ? m.score : "—"}/100 (${m.label}).` });
  };

  const handleCopy = async () => {
    if (!model) return;
    const ok = await copyToClipboard(reportToPlainText(model));
    if (ok) {
      setCopied(true);
      toast({ title: "Report copied" });
      setTimeout(() => setCopied(false), 2000);
    } else {
      setShowFallback(true);
      toast({ title: "Copy not available", description: "Select the text below and copy it manually.", variant: "destructive" });
    }
  };

  const handlePrint = () => {
    if (!model) return;
    const ok = printReport(model);
    if (!ok) toast({ title: "Pop-up blocked", description: "Allow pop-ups to open the print view.", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-2xl border border-border bg-card/70 p-5">
        <h3 className="font-sora font-bold text-lg mb-1">Security Audit Report</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Generate a professional, client-ready report from a completed scan. Print-friendly and copy-friendly.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={scanId} onValueChange={setScanId}>
            <SelectTrigger className="w-72"><SelectValue placeholder="Select a scan" /></SelectTrigger>
            <SelectContent>
              {reportableScans.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.scan_type} · {formatDate(s.completed_at || s.started_at)}
                  {s.overall_score != null ? ` · ${Math.round(s.overall_score)}/100` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} className="gap-2">
            <Sparkles className="w-4 h-4" /> Generate Report
          </Button>
          {model && (
            <>
              <Button onClick={handleCopy} variant="outline" className="gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy Report"}
              </Button>
              <Button onClick={handlePrint} variant="outline" className="gap-2">
                <Printer className="w-4 h-4" /> Print / Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Preview */}
      {model ? (
        <>
          {showFallback && (
            <Textarea
              readOnly
              value={reportToPlainText(model)}
              onFocus={(e) => e.target.select()}
              className="h-64 font-mono text-xs"
            />
          )}
          <ReportDocument model={model} />
        </>
      ) : (
        <EmptyState
          icon={FileText}
          title="No report generated yet"
          description="Select a scan and click Generate Report to build the audit report preview."
        />
      )}
    </div>
  );
}