"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Bell } from "lucide-react";

interface Alert {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceRole: string;
  description: string;
  status: string;
  createdAt: string;
  transactionId?: string | null;
  communicationId?: string | null;
  transaction?: {
    id: string;
    amount: number;
    currency: string;
    merchantName: string;
    country: string;
    riskScore: number;
  } | null;
}

export default function TelecomAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchAlerts = useCallback(async () => {
    try {
      const params = new URLSearchParams({ targetRole: "TELECOM_OPERATOR" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/alerts?${params.toString()}`);
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : data.alerts ?? []);
    } catch (err) {
      console.error("Failed to fetch telecom alerts", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    fetchAlerts();
  }, [fetchAlerts]);

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

  const statusCounts = alerts.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
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
      <div>
        <h1 className="text-2xl font-semibold text-white">Telecom Alerts</h1>
        <p className="text-sm text-[#8899AA] mt-1">
          Alerts targeted to telecom operators from cross-sector intelligence
        </p>
      </div>

      {/* Status summary + filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-1.5">
              <StatusBadge status={status} />
              <span className="font-data text-xs text-white">{count}</span>
            </div>
          ))}
        </div>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-swed-card border-swed-border text-white text-sm h-9">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-swed-card border-swed-border">
              <SelectItem value="ALL" className="text-white text-sm">All Statuses</SelectItem>
              <SelectItem value="OPEN" className="text-white text-sm">Open</SelectItem>
              <SelectItem value="ACKNOWLEDGED" className="text-white text-sm">Acknowledged</SelectItem>
              <SelectItem value="IN_PROGRESS" className="text-white text-sm">In Progress</SelectItem>
              <SelectItem value="RESOLVED" className="text-white text-sm">Resolved</SelectItem>
              <SelectItem value="DISMISSED" className="text-white text-sm">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alert list */}
      {alerts.length === 0 ? (
        <div className="bg-swed-card border border-swed-border rounded-xl p-12 text-center">
          <Bell className="h-10 w-10 text-[#8899AA] mx-auto mb-3" />
          <p className="text-sm text-[#8899AA]">No alerts match your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id}>
              <AlertCard
                alert={alert}
                onAcknowledge={(id) => handleAlertAction(id, "ACKNOWLEDGED")}
                onResolve={(id) => handleAlertAction(id, "RESOLVED")}
                onDismiss={(id) => handleAlertAction(id, "DISMISSED")}
              />
              {/* Cross-reference with transaction data */}
              {alert.transaction && (
                <div className="ml-4 mt-2 bg-swed-surface border border-swed-border rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#8899AA] mb-2">
                    Linked Transaction
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] text-[#8899AA]">Amount</p>
                      <p className="font-data text-sm text-white">
                        {alert.transaction.currency} {alert.transaction.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8899AA]">Merchant</p>
                      <p className="text-sm text-white truncate">
                        {alert.transaction.merchantName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8899AA]">Country</p>
                      <p className="text-sm text-white">
                        {alert.transaction.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#8899AA]">Risk Score</p>
                      <p className="font-data text-sm text-white">
                        {(alert.transaction.riskScore * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
