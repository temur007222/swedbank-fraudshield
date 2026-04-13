"use client";

import { useEffect, useState, useCallback } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { RiskBadge } from "@/components/dashboard/RiskBadge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Bell,
  ShieldOff,
  MessageSquare,
  PhoneOff,
  Phone,
  Ban,
  Flag,
  CheckCircle,
  Forward,
  Loader2,
  Radio,
  Wifi,
  Signal,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Alert {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceRole: string;
  description: string;
  status: string;
  createdAt: string;
  transactionId?: string | null;
}

interface Communication {
  id: string;
  type: string;
  senderNumber: string | null;
  senderEmail: string | null;
  content: string | null;
  timestamp: string;
  fraudScore: number;
  classification: string;
  patterns: string;
}

export default function TelecomDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [alertsRes, commsRes] = await Promise.all([
        fetch("/api/alerts?targetRole=TELECOM_OPERATOR"),
        fetch("/api/communications"),
      ]);
      const alertsData = await alertsRes.json();
      const commsData = await commsRes.json();
      setAlerts(Array.isArray(alertsData) ? alertsData : alertsData.alerts ?? []);
      setCommunications(Array.isArray(commsData) ? commsData : commsData.communications ?? []);
    } catch (err) {
      console.error("Failed to fetch telecom data", err);
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

  const handleNumberAction = async (commId: string, action: string) => {
    const relatedAlert = alerts.find((a) => a.description.includes(commId));
    if (relatedAlert) {
      const statusMap: Record<string, string> = {
        block: "RESOLVED",
        flag: "IN_PROGRESS",
        legitimate: "DISMISSED",
        forward: "ESCALATED",
      };
      await handleAlertAction(relatedAlert.id, statusMap[action] ?? "ACKNOWLEDGED");
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === "OPEN" || a.status === "ACKNOWLEDGED");
  const blockedNumbers = communications.filter((c) => c.classification === "FRAUD" || c.classification === "BLOCKED");
  const smsAnalyzed = communications.filter((c) => c.type === "SMS");
  const vishingDetected = communications.filter(
    (c) => c.type === "PHONE_CALL" && c.fraudScore >= 0.7
  );

  // Build phone number reputation from communications
  const numberMap = new Map<string, { count: number; maxScore: number; types: Set<string>; classification: string }>();
  communications.forEach((c) => {
    const num = c.senderNumber ?? "Unknown";
    const existing = numberMap.get(num);
    if (existing) {
      existing.count += 1;
      existing.maxScore = Math.max(existing.maxScore, c.fraudScore);
      existing.types.add(c.type);
      if (c.classification === "FRAUD") existing.classification = "FRAUD";
    } else {
      numberMap.set(num, {
        count: 1,
        maxScore: c.fraudScore,
        types: new Set([c.type]),
        classification: c.classification,
      });
    }
  });

  const flaggedNumbers = Array.from(numberMap.entries())
    .filter(([, info]) => info.maxScore >= 0.5)
    .sort((a, b) => b[1].maxScore - a[1].maxScore)
    .slice(0, 10);

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
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#3B82F6]/10 rounded-xl border border-[#3B82F6]/20">
              <Phone className="h-5 w-5 text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Telecom Operator Dashboard
              </h1>
              <p className="text-sm text-[#8899AA] mt-0.5">
                Monitor suspicious phone activity and manage number reputations
              </p>
            </div>
          </div>
          {/* Real-time monitoring status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            <span className="text-[10px] text-success font-medium uppercase tracking-wider">
              Live Monitoring
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Alerts"
          value={activeAlerts.length}
          icon={Bell}
          iconColor="text-danger"
          trend={
            activeAlerts.length > 0
              ? { value: activeAlerts.length, direction: "up" }
              : undefined
          }
        />
        <StatCard
          title="Blocked Numbers"
          value={blockedNumbers.length}
          icon={ShieldOff}
          iconColor="text-swed-orange"
        />
        <StatCard
          title="SMS Analyzed"
          value={smsAnalyzed.length}
          icon={MessageSquare}
          iconColor="text-[#3B82F6]"
        />
        <StatCard
          title="Vishing Detected"
          value={vishingDetected.length}
          icon={PhoneOff}
          iconColor="text-warning"
        />
      </div>

      {/* Real-time Monitoring Status Bar */}
      <div className="bg-swed-card border border-swed-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="h-4 w-4 text-[#3B82F6]" />
          <h3 className="text-sm font-semibold text-white">Monitoring Status</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Network Scan", icon: Wifi, status: "active", color: "#00C48C" },
            { label: "SMS Filter", icon: MessageSquare, status: "active", color: "#00C48C" },
            { label: "Call Analysis", icon: Phone, status: "active", color: "#00C48C" },
            { label: "Threat Intel", icon: Signal, status: communications.length > 0 ? "active" : "standby", color: communications.length > 0 ? "#FFBE0B" : "#556677" },
          ].map((monitor) => {
            const Icon = monitor.icon;
            return (
              <div
                key={monitor.label}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-swed-surface/50 border border-swed-border/50"
              >
                <div className="p-1.5 rounded-lg" style={{ background: `${monitor.color}15` }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: monitor.color }} />
                </div>
                <div>
                  <p className="text-[11px] text-white font-medium">{monitor.label}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: monitor.color }}
                    />
                    <span className="text-[9px] uppercase tracking-wider font-medium" style={{ color: monitor.color }}>
                      {monitor.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incoming Alerts from Bank */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-white">Incoming Alerts</h2>
            {activeAlerts.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20 font-data font-semibold">
                {activeAlerts.length} active
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-[#3B82F6]" />
            <span className="text-[10px] text-[#8899AA]">Real-time feed</span>
          </div>
        </div>
        {activeAlerts.length === 0 ? (
          <div className="bg-swed-card border border-swed-border rounded-xl p-8 text-center">
            <CheckCircle className="h-8 w-8 text-success/40 mx-auto mb-3" />
            <p className="text-sm text-[#8899AA]">No active alerts</p>
            <p className="text-xs text-[#556677] mt-1">All incoming alerts have been processed</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeAlerts.slice(0, 6).map((alert) => (
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

      {/* Phone Number Reputation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-white">Flagged Phone Numbers</h2>
            {flaggedNumbers.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20 font-data font-semibold">
                {flaggedNumbers.length} flagged
              </span>
            )}
          </div>
        </div>
        {flaggedNumbers.length === 0 ? (
          <div className="bg-swed-card border border-swed-border rounded-xl p-8 text-center">
            <Phone className="h-8 w-8 text-[#556677] mx-auto mb-3" />
            <p className="text-sm text-[#8899AA]">
              No flagged numbers at this time
            </p>
            <p className="text-xs text-[#556677] mt-1">Numbers will appear here when fraud scores exceed threshold</p>
          </div>
        ) : (
          <div className="space-y-3">
            {flaggedNumbers.map(([number, info]) => {
              const riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" =
                info.maxScore >= 0.9
                  ? "CRITICAL"
                  : info.maxScore >= 0.7
                    ? "HIGH"
                    : info.maxScore >= 0.5
                      ? "MEDIUM"
                      : "LOW";

              const riskColor =
                riskLevel === "CRITICAL"
                  ? "#FF4757"
                  : riskLevel === "HIGH"
                    ? "#FF6100"
                    : riskLevel === "MEDIUM"
                      ? "#FFBE0B"
                      : "#00C48C";

              const scorePercent = Math.round(info.maxScore * 100);

              return (
                <div
                  key={number}
                  className="bg-swed-card border border-swed-border rounded-xl overflow-hidden hover:border-swed-border/80 transition-all group"
                  style={{
                    borderLeftWidth: "3px",
                    borderLeftColor: riskColor,
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2.5 rounded-xl relative"
                          style={{
                            background: `${riskColor}10`,
                            border: `1px solid ${riskColor}25`,
                          }}
                        >
                          <Phone className="h-4 w-4" style={{ color: riskColor }} />
                          {/* Live indicator for high risk */}
                          {riskLevel === "CRITICAL" && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: riskColor }} />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: riskColor }} />
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-data text-sm text-white font-medium">{number}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-[#8899AA]">
                              {info.count} communication{info.count !== 1 ? "s" : ""}
                            </span>
                            <span className="text-[10px] text-[#667788]">|</span>
                            <span className="text-xs text-[#8899AA]">
                              {Array.from(info.types).join(", ")}
                            </span>
                            <RiskBadge level={riskLevel} />
                            <StatusBadge status={info.classification} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Fraud score indicator */}
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-swed-surface overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${scorePercent}%`,
                                background: riskColor,
                              }}
                            />
                          </div>
                          <span
                            className="font-data text-sm font-bold min-w-[36px] text-right"
                            style={{ color: riskColor }}
                          >
                            {scorePercent}%
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:text-danger hover:bg-danger/10 h-7 text-xs rounded-lg"
                            onClick={() => handleNumberAction(number, "block")}
                          >
                            <Ban className="h-3 w-3 mr-1" />
                            Block
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-warning hover:text-warning hover:bg-warning/10 h-7 text-xs rounded-lg"
                            onClick={() => handleNumberAction(number, "flag")}
                          >
                            <Flag className="h-3 w-3 mr-1" />
                            Flag
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-success hover:text-success hover:bg-success/10 h-7 text-xs rounded-lg"
                            onClick={() => handleNumberAction(number, "legitimate")}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Legit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#8B5CF6] hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 h-7 text-xs rounded-lg"
                            onClick={() => handleNumberAction(number, "forward")}
                          >
                            <Forward className="h-3 w-3 mr-1" />
                            Authority
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
