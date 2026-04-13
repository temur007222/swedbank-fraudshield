"use client";

import { RiskBadge } from "./RiskBadge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  alert: {
    id: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    sourceRole: string;
    description: string;
    status: string;
    createdAt: string;
    transactionId?: string | null;
  };
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

const roleLabels: Record<string, string> = {
  BANK_ANALYST: "Bank",
  TELECOM_OPERATOR: "Telecom",
  AUTHORITY_OFFICER: "Authority",
};

const severityBorderMap: Record<string, string> = {
  LOW: "severity-border-low",
  MEDIUM: "severity-border-medium",
  HIGH: "severity-border-high",
  CRITICAL: "severity-border-critical",
};

export function AlertCard({
  alert,
  onAcknowledge,
  onResolve,
  onDismiss,
}: AlertCardProps) {
  const timeAgo = formatDistanceToNow(new Date(alert.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      className={cn(
        "bg-swed-card border border-swed-border rounded-xl p-4 hover-lift transition-all duration-200",
        "hover:border-swed-orange/20",
        severityBorderMap[alert.severity],
        alert.severity === "CRITICAL" && "critical-glow",
        alert.severity === "HIGH" && "high-glow"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <RiskBadge level={alert.severity} />
          <span className="text-xs text-[#8899AA] bg-swed-surface/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-swed-border/50">
            {roleLabels[alert.sourceRole] || alert.sourceRole}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#8899AA]">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </div>
      </div>

      <p className="text-sm text-white mb-1 line-clamp-2 leading-relaxed">{alert.description}</p>

      {alert.transactionId && (
        <p className="text-xs text-[#8899AA] font-mono mb-3 bg-swed-surface/50 inline-block px-2 py-0.5 rounded">
          TX: {alert.transactionId.slice(0, 12)}...
        </p>
      )}

      {alert.status === "OPEN" && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-swed-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAcknowledge?.(alert.id)}
            className="text-info hover:text-info hover:bg-info/10 h-7 text-xs transition-colors duration-200"
          >
            <Eye className="h-3 w-3 mr-1" />
            Acknowledge
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onResolve?.(alert.id)}
            className="text-success hover:text-success hover:bg-success/10 h-7 text-xs transition-colors duration-200"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolve
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss?.(alert.id)}
            className="text-[#8899AA] hover:text-[#8899AA] hover:bg-[#8899AA]/10 h-7 text-xs transition-colors duration-200"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}
