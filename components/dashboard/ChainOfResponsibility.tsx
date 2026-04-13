"use client";

import { cn } from "@/lib/utils";
import {
  ShieldAlert,
  Building2,
  Phone,
  Scale,
  ArrowRight,
} from "lucide-react";

interface ChainStep {
  role: string;
  action: string;
  timestamp: string;
  status: string;
}

interface ChainOfResponsibilityProps {
  chain: ChainStep[];
}

const ROLE_CONFIG: Record<
  string,
  { icon: typeof ShieldAlert; color: string; bg: string }
> = {
  Detection: {
    icon: ShieldAlert,
    color: "text-danger",
    bg: "bg-danger/10",
  },
  "Bank Analysis": {
    icon: Building2,
    color: "text-swed-orange",
    bg: "bg-swed-orange/10",
  },
  "Telecom Alert": {
    icon: Phone,
    color: "text-info",
    bg: "bg-info/10",
  },
  "Authority Report": {
    icon: Scale,
    color: "text-success",
    bg: "bg-success/10",
  },
};

function getConfig(role: string) {
  return (
    ROLE_CONFIG[role] ?? {
      icon: ShieldAlert,
      color: "text-[#8899AA]",
      bg: "bg-swed-surface",
    }
  );
}

const STATUS_COLORS: Record<string, string> = {
  completed: "text-success bg-success/10",
  pending: "text-warning bg-warning/10",
  in_progress: "text-info bg-info/10",
  failed: "text-danger bg-danger/10",
};

export function ChainOfResponsibility({ chain }: ChainOfResponsibilityProps) {
  return (
    <div className="bg-swed-card border border-swed-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-white mb-5">
        Chain of Responsibility
      </h3>
      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {chain.map((step, index) => {
          const config = getConfig(step.role);
          const Icon = config.icon;
          const statusClass =
            STATUS_COLORS[step.status] ?? "text-[#8899AA] bg-swed-surface";

          return (
            <div key={index} className="flex items-start shrink-0">
              <div className="flex flex-col items-center w-44">
                {/* Node circle */}
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2",
                    config.bg,
                    config.color,
                    step.status === "completed"
                      ? "border-current"
                      : "border-swed-border"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Details */}
                <div className="mt-3 text-center">
                  <p className={cn("text-xs font-semibold", config.color)}>
                    {step.role}
                  </p>
                  <p className="text-[11px] text-[#8899AA] mt-1 leading-snug max-w-[140px]">
                    {step.action}
                  </p>
                  <p className="text-[10px] font-data text-[#556677] mt-1.5">
                    {step.timestamp}
                  </p>
                  <span
                    className={cn(
                      "inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize",
                      statusClass
                    )}
                  >
                    {step.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Arrow connector */}
              {index < chain.length - 1 && (
                <div className="flex items-center mt-5 px-1">
                  <div className="w-8 h-px bg-swed-border" />
                  <ArrowRight className="h-3.5 w-3.5 text-[#556677] -ml-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
