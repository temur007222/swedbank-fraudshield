"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCard } from "@/components/dashboard/AlertCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

interface Alert {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceRole: string;
  description: string;
  status: string;
  createdAt: string;
  transactionId?: string | null;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "ACKNOWLEDGED", label: "Acknowledged" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
];

const SEVERITY_ORDER: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("targetRole", "BANK_ANALYST");
      params.set("page", String(page));
      params.set("limit", "20");
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const res = await fetch(`/api/alerts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const sorted = (data.alerts || []).sort(
          (a: Alert, b: Alert) =>
            (SEVERITY_ORDER[a.severity] ?? 4) -
            (SEVERITY_ORDER[b.severity] ?? 4)
        );
        setAlerts(sorted);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  async function handleAlertAction(alertId: string, status: string) {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      // Remove from list or refresh
      if (statusFilter !== "all" && status !== statusFilter) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
        setTotal((prev) => prev - 1);
      } else {
        fetchAlerts();
      }
    } catch {
      // Silently handle errors
    }
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Alert Queue</h1>
          <p className="text-sm text-[#8899AA] mt-1">
            {total} alert{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px] bg-swed-card border-swed-border text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-swed-card border-swed-border">
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-white focus:bg-swed-surface focus:text-white"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-swed-card border border-swed-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-swed-card border border-swed-border rounded-xl p-12 text-center">
          <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-[#8899AA] opacity-50" />
          <p className="text-sm text-[#8899AA]">No alerts found</p>
          {statusFilter !== "all" && (
            <p className="text-xs text-[#556677] mt-1">
              Try changing the status filter
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={(id) =>
                handleAlertAction(id, "ACKNOWLEDGED")
              }
              onResolve={(id) => handleAlertAction(id, "RESOLVED")}
              onDismiss={(id) => handleAlertAction(id, "DISMISSED")}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-[#8899AA]">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-swed-border text-[#8899AA] hover:text-white hover:bg-swed-surface disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={
                      pageNum === page
                        ? "bg-swed-orange text-white hover:bg-swed-orange/90 h-8 w-8 p-0"
                        : "text-[#8899AA] hover:text-white hover:bg-swed-surface h-8 w-8 p-0"
                    }
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-swed-border text-[#8899AA] hover:text-white hover:bg-swed-surface disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
