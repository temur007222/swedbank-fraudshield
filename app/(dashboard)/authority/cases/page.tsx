"use client";

import { useEffect, useState, useCallback } from "react";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ChainOfResponsibility } from "@/components/dashboard/ChainOfResponsibility";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
} from "lucide-react";

interface ChainStep {
  role: string;
  action: string;
  timestamp: string;
  status: string;
}

interface Alert {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceRole: string;
  description: string;
  status: string;
  createdAt: string;
  transactionId?: string | null;
  communicationId?: string | null;
  evidence?: string;
  chainOfResponsibility?: string;
}

export default function CaseManagementPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    try {
      const params = new URLSearchParams({ targetRole: "AUTHORITY_OFFICER" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/alerts?${params.toString()}`);
      const data = await res.json();
      const allAlerts: Alert[] = Array.isArray(data) ? data : data.alerts ?? [];
      // Show escalated / in-progress cases primarily
      setAlerts(allAlerts);
    } catch (err) {
      console.error("Failed to fetch cases", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    fetchCases();
  }, [fetchCases]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      console.error("Failed to update case status", err);
    }
  };

  const parseChain = (raw?: string): ChainStep[] => {
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const parseEvidence = (raw?: string): string[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item: Record<string, unknown>) => {
        if (typeof item === "string") return item;
        // Convert evidence objects to readable strings
        const type = item.type || "unknown";
        const details = Object.entries(item)
          .filter(([k]) => k !== "type")
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        return `${type}${details ? ` (${details})` : ""}`;
      });
    } catch {
      return [];
    }
  };

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
        <h1 className="text-2xl font-semibold text-white">Case Management</h1>
        <p className="text-sm text-[#8899AA] mt-1">
          Investigate and manage escalated fraud cases
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <span className="font-data text-sm text-white">
          {alerts.length} case{alerts.length !== 1 ? "s" : ""}
        </span>
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

      {/* Cases */}
      {alerts.length === 0 ? (
        <div className="bg-swed-card border border-swed-border rounded-xl p-12 text-center">
          <Briefcase className="h-10 w-10 text-[#8899AA] mx-auto mb-3" />
          <p className="text-sm text-[#8899AA]">No cases match your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const chain = parseChain(alert.chainOfResponsibility);
            const evidence = parseEvidence(alert.evidence);
            const isExpanded = expandedCase === alert.id;

            return (
              <div
                key={alert.id}
                className="bg-swed-card border border-swed-border rounded-xl overflow-hidden"
              >
                {/* Case header */}
                <div
                  className="p-4 cursor-pointer hover:bg-swed-surface/30 transition-colors"
                  onClick={() =>
                    setExpandedCase(isExpanded ? null : alert.id)
                  }
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-[#8899AA]" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[#8899AA]" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-data text-xs text-[#8899AA]">
                            {alert.id.slice(0, 12)}...
                          </span>
                          <RiskBadge level={alert.severity} />
                          <StatusBadge status={alert.status} />
                        </div>
                        <p className="text-sm text-white">{alert.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8899AA]">
                        From: {alert.sourceRole.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-[#8899AA]">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded case details */}
                {isExpanded && (
                  <div className="border-t border-swed-border p-4 space-y-4">
                    {/* Status management */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-[#8899AA] mr-2">
                        Update status:
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-info hover:text-info hover:bg-info/10 h-7 text-xs"
                        onClick={() => handleStatusUpdate(alert.id, "IN_PROGRESS")}
                      >
                        <Search className="h-3 w-3 mr-1" />
                        Investigating
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-success hover:text-success hover:bg-success/10 h-7 text-xs"
                        onClick={() => handleStatusUpdate(alert.id, "RESOLVED")}
                      >
                        Resolved
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#8899AA] hover:text-[#8899AA] hover:bg-[#8899AA]/10 h-7 text-xs"
                        onClick={() => handleStatusUpdate(alert.id, "DISMISSED")}
                      >
                        Dismissed
                      </Button>
                    </div>

                    {/* Evidence */}
                    {evidence.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-white mb-2 flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-[#8899AA]" />
                          Evidence
                        </h4>
                        <div className="space-y-1">
                          {evidence.map((e, i) => (
                            <p
                              key={i}
                              className="text-xs text-[#8899AA] bg-swed-surface rounded-lg px-3 py-2"
                            >
                              {e}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chain of Responsibility */}
                    {chain.length > 0 && (
                      <ChainOfResponsibility chain={chain} />
                    )}

                    {/* Linked IDs */}
                    <div className="flex items-center gap-4 text-xs text-[#8899AA]">
                      {alert.transactionId && (
                        <span>
                          Transaction:{" "}
                          <span className="font-data text-white">
                            {alert.transactionId.slice(0, 12)}...
                          </span>
                        </span>
                      )}
                      {alert.communicationId && (
                        <span>
                          Communication:{" "}
                          <span className="font-data text-white">
                            {alert.communicationId.slice(0, 12)}...
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
