import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, FolderKanban, Boxes, ScrollText, Wand2, ShieldAlert, ClipboardCheck, DollarSign } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import LoadingState from "@/components/shared/LoadingState";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentRuns, setRecentRuns] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.User.list("-created_date", 500),
      base44.entities.Project.list("-created_date", 500),
      base44.entities.Blueprint.list("-created_date", 500),
      base44.entities.PromptPack.list("-created_date", 500),
      base44.entities.SecurityFinding.list("-created_date", 500),
      base44.entities.QAItem.list("-created_date", 500),
      base44.entities.AgentRun.list("-created_date", 500),
      base44.entities.Payment.filter({ status: "completed" }, "-created_date", 500),
    ]).then(([users, projects, blueprints, packs, findings, qa, runs, sales]) => {
      setStats({
        sales: sales.length,
        revenue: sales.reduce((s, p) => s + (p.amountCents || 0), 0),
        users: users.length,
        projects: projects.length,
        blueprints: blueprints.length,
        packs: packs.length,
        findings: findings.length,
        qa: qa.length,
        runs: runs.length,
      });
      setRecentRuns(runs.slice(0, 8));
    });
  }, []);

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Platform overview and activity." />
      {!stats ? (
        <LoadingState />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link to="/admin/users"><StatCard icon={Users} label="Total Users" value={stats.users} /></Link>
            <Link to="/admin/projects"><StatCard icon={FolderKanban} label="Total Projects" value={stats.projects} /></Link>
            <Link to="/admin/blueprints"><StatCard icon={Boxes} label="Blueprints Generated" value={stats.blueprints} /></Link>
            <StatCard icon={Wand2} label="Prompt Packs" value={stats.packs} />
            <StatCard icon={ShieldAlert} label="Security Findings" value={stats.findings} />
            <StatCard icon={ClipboardCheck} label="QA Items" value={stats.qa} />
            <Link to="/admin/logs"><StatCard icon={ScrollText} label="AI Runs" value={stats.runs} /></Link>
            <Link to="/admin/sales"><StatCard icon={DollarSign} label="Total Sales" value={`$${((stats.revenue || 0) / 100).toFixed(2)}`} /></Link>
          </div>

          <div>
            <h2 className="font-sora font-semibold text-lg mb-4">Recent AI Runs</h2>
            <div className="rounded-2xl border border-border bg-card/60 divide-y divide-border">
              {recentRuns.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">No AI runs yet.</p>
              ) : (
                recentRuns.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{r.agentName}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.inputSummary || r.outputSummary || "—"}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                        r.status === "success" ? "bg-green-500/15 text-green-400"
                        : r.status === "failed" ? "bg-destructive/15 text-destructive"
                        : "bg-secondary text-muted-foreground"
                      }`}>{r.status}</span>
                      <span className="text-xs text-muted-foreground">{r.created_date ? new Date(r.created_date).toLocaleDateString() : ""}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}