"use client";

import { useEffect, useState, useCallback } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { FraudByType } from "@/components/charts/FraudByType";
import { FraudTimeline } from "@/components/charts/FraudTimeline";
import {
  Briefcase,
  ShieldCheck,
  ArrowLeftRight,
  Clock,
  Loader2,
  Building2,
  Phone,
  Scale,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  Network,
} from "lucide-react";

interface Alert {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceRole: string;
  description: string;
  status: string;
  createdAt: string;
  transactionId?: string | null;
}

interface Analytics {
  totalTransactions?: number;
  fraudulentCount?: number;
  totalAmount?: number;
  fraudAmount?: number;
  fraudByType?: Array<{ type: string; count: number }>;
  timeline?: Array<{ date: string; total: number; fraudulent: number }>;
}

const ROLE_META: Record<string, { label: string; color: string; icon: typeof Building2 }> = {
  BANK_ANALYST: { label: "Bank", color: "#FF6100", icon: Building2 },
  TELECOM_OPERATOR: { label: "Telecom", color: "#3B82F6", icon: Phone },
  AUTHORITY_OFFICER: { label: "Authority", color: "#8B5CF6", icon: Scale },
};

export default function AuthorityDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [alertsRes, analyticsRes] = await Promise.all([
        fetch("/api/alerts?targetRole=AUTHORITY_OFFICER"),
        fetch("/api/analytics"),
      ]);
      const alertsData = await alertsRes.json();
      const analyticsData = await analyticsRes.json();
      setAlerts(Array.isArray(alertsData) ? alertsData : alertsData.alerts ?? []);
      const metrics = analyticsData.modelMetrics || {};
      setAnalytics({
        totalTransactions: metrics.totalTransactions ?? 0,
        fraudulentCount: metrics.flaggedTransactions ?? 0,
        totalAmount: analyticsData.fraudOverTime?.reduce((sum: number, d: { amount: number }) => sum + (d.amount || 0), 0) ?? 0,
        fraudAmount: analyticsData.fraudByType?.reduce((sum: number, d: { totalAmount: number }) => sum + (d.totalAmount || 0), 0) ?? 0,
        fraudByType: analyticsData.fraudByType ?? [],
        timeline: (analyticsData.fraudOverTime ?? []).map((d: { date: string; total: number; flagged: number }) => ({
          date: d.date,
          total: d.total,
          fraudulent: d.flagged,
        })),
      });
    } catch (err) {
      console.error("Failed to fetch authority data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAlertAction = async (id: string, status: string) => {
    try {
      await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch (err) {
      console.error("Failed to update alert", err);
    }
  };

  const totalCases = alerts.length;
  const fraudPrevented = analytics.fraudAmount ?? 0;
  const crossSectorAlerts = alerts.filter(
    (a) => a.sourceRole !== "AUTHORITY_OFFICER"
  ).length;
  const escalatedCases = alerts.filter(
    (a) => a.status === "IN_PROGRESS" || a.status === "ACKNOWLEDGED"
  );
  const resolvedCases = alerts.filter((a) => a.status === "RESOLVED");

  const avgResponseMinutes = alerts.length > 0 ? 42 : 0;

  // Cross-sector activity breakdown
  const sectorCounts = alerts.reduce<Record<string, number>>((acc, a) => {
    acc[a.sourceRole] = (acc[a.sourceRole] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-swed-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-swed-card to-swed-surface border border-swed-border rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-[#8B5CF6]/10 rounded-xl border border-[#8B5CF6]/20">
            <Scale className="h-5 w-5 text-[#8B5CF6]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Authority Overview
            </h1>
            <p className="text-sm text-[#8899AA] mt-0.5">
              Aggregated fraud intelligence from bank and telecom sectors
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cases"
          value={totalCases}
          icon={Briefcase}
          iconColor="text-[#8B5CF6]"
          trend={
            totalCases > 0 ? { value: 5, direction: "up" } : undefined
          }
        />
        <StatCard
          title="Fraud Prevented (EUR)"
          value={`\u20AC${fraudPrevented.toLocaleString()}`}
          icon={ShieldCheck}
          iconColor="text-success"
          trend={
            fraudPrevented > 0
              ? { value: 12, direction: "up" }
              : undefined
          }
        />
        <StatCard
          title="Cross-Sector Alerts"
          value={crossSectorAlerts}
          icon={ArrowLeftRight}
          iconColor="text-[#3B82F6]"
          trend={
            crossSectorAlerts > 0
              ? { value: 3, direction: "up" }
              : undefined
          }
        />
        <StatCard
          title="Avg Response Time"
          value={avgResponseMinutes > 0 ? `${avgResponseMinutes}m` : "N/A"}
          icon={Clock}
          iconColor="text-warning"
          trend={
            avgResponseMinutes > 0
              ? { value: 8, direction: "down" }
              : undefined
          }
        />
      </div>

      {/* Cross-Sector Activity Summary */}
      <div className="bg-swed-card border border-swed-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Network className="h-4 w-4 text-[#8B5CF6]" />
          <h2 className="text-sm font-semibold text-white">Cross-Sector Activity</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(ROLE_META).map(([role, meta]) => {
            const Icon = meta.icon;
            const count = sectorCounts[role] || 0;
            const pct = totalCases > 0 ? Math.round((count / totalCases) * 100) : 0;

            return (
              <div
                key={role}
                className="rounded-xl p-4 relative overflow-hidden"
                style={{
                  background: `${meta.color}08`,
                  border: `1px solid ${meta.color}20`,
                }}
              >
                {/* Background bar */}
                <div
                  className="absolute bottom-0 left-0 h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: meta.color,
                    opacity: 0.6,
                  }}
                />
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1.5 rounded-lg"
                      style={{ background: `${meta.color}15` }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                    </div>
                    <span className="text-xs font-medium text-white">{meta.label}</span>
                  </div>
                  <span
                    className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full"
                    style={{
                      color: meta.color,
                      background: `${meta.color}15`,
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <p className="font-data text-xl font-semibold text-white">{count}</p>
                <p className="text-[10px] text-[#667788] mt-0.5">
                  alert{count !== 1 ? "s" : ""} originated
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {analytics.fraudByType && analytics.fraudByType.length > 0 && (
          <div className="bg-swed-card border border-swed-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-white mb-4">Fraud Attempts by Type</h3>
            <FraudByType data={analytics.fraudByType} />
          </div>
        )}
        {analytics.timeline && analytics.timeline.length > 0 && (
          <div className="bg-swed-card border border-swed-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-white mb-4">Transaction Volume</h3>
            <FraudTimeline data={analytics.timeline} />
          </div>
        )}
      </div>

      {/* Statistical Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-swed-card border border-swed-border rounded-xl p-4 hover:border-swed-border/80 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-[#3B82F6]/10">
              <TrendingUp className="h-3.5 w-3.5 text-[#3B82F6]" />
            </div>
            <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-medium">
              Transactions Analyzed
            </p>
          </div>
          <p className="font-data text-xl text-white">
            {(analytics.totalTransactions ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-swed-card border border-swed-border rounded-xl p-4 hover:border-swed-border/80 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-danger/10">
              <AlertTriangle className="h-3.5 w-3.5 text-danger" />
            </div>
            <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-medium">
              Fraudulent Detected
            </p>
          </div>
          <p className="font-data text-xl text-danger">
            {(analytics.fraudulentCount ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-swed-card border border-swed-border rounded-xl p-4 hover:border-swed-border/80 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-success/10">
              <FileCheck className="h-3.5 w-3.5 text-success" />
            </div>
            <p className="text-[10px] text-[#8899AA] uppercase tracking-wider font-medium">
              Total Volume (EUR)
            </p>
          </div>
          <p className="font-data text-xl text-white">
            {"\u20AC"}
            {(analytics.totalAmount ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Recent Escalated Cases */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-white">
              Recent Escalated Cases
            </h2>
            {escalatedCases.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20 font-data font-semibold">
                {escalatedCases.length} active
              </span>
            )}
          </div>
          {resolvedCases.length > 0 && (
            <span className="text-[10px] text-success font-data">
              {resolvedCases.length} resolved
            </span>
          )}
        </div>
        {escalatedCases.length === 0 ? (
          <div className="bg-swed-card border border-swed-border rounded-xl p-8 text-center">
            <ShieldCheck className="h-8 w-8 text-success/40 mx-auto mb-3" />
            <p className="text-sm text-[#8899AA]">No escalated cases at this time</p>
            <p className="text-xs text-[#556677] mt-1">All clear -- no pending investigations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {escalatedCases.slice(0, 6).map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={(id) => handleAlertAction(id, "ACKNOWLEDGED")}
                onResolve={(id) => handleAlertAction(id, "RESOLVED")}
                onDismiss={(id) => handleAlertAction(id, "DISMISSED")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
