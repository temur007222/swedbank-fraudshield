"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Bell,
  Phone,
  FileText,
  Shield,
  Link2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  role: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  BANK_ANALYST: [
    { label: "Dashboard", href: "/bank", icon: LayoutDashboard },
    { label: "Transactions", href: "/bank/transactions", icon: ArrowLeftRight },
    { label: "Analytics", href: "/bank/analytics", icon: BarChart3 },
    { label: "Alerts", href: "/bank/alerts", icon: Bell },
  ],
  TELECOM_OPERATOR: [
    { label: "Dashboard", href: "/telecom", icon: LayoutDashboard },
    { label: "Phone Numbers", href: "/telecom/numbers", icon: Phone },
    { label: "Alerts", href: "/telecom/alerts", icon: Bell },
  ],
  AUTHORITY_OFFICER: [
    { label: "Overview", href: "/authority", icon: LayoutDashboard },
    { label: "Cases", href: "/authority/cases", icon: FileText },
    { label: "Compliance", href: "/authority/compliance", icon: Shield },
  ],
};

const SHARED_NAV: NavItem[] = [
  { label: "Chain of Responsibility", href: "/shared/chain", icon: Link2 },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const roleNav = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.BANK_ANALYST;
  const navItems = [...roleNav, ...SHARED_NAV];

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen bg-swed-dark border-r border-swed-border flex flex-col z-40 transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-swed-border shrink-0">
        <ShieldCheck className="h-7 w-7 text-swed-orange shrink-0" />
        {!collapsed && (
          <span className="text-sm font-semibold text-white whitespace-nowrap">
            FraudShield AI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isBase = ["/bank", "/telecom", "/authority"].includes(item.href);
          const isActive =
            pathname === item.href ||
            (!isBase && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-swed-orange/10 text-swed-orange font-medium"
                  : "text-[#8899AA] hover:text-white hover:bg-swed-surface"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-swed-border p-3 space-y-2">
        {/* Role badge */}
        {!collapsed && (
          <div className="px-2 py-1.5">
            <p className="text-[10px] uppercase tracking-wider text-[#556677]">
              Role
            </p>
            <p className="text-xs text-white font-medium mt-0.5">
              {role.replace(/_/g, " ")}
            </p>
          </div>
        )}

        {/* Sign out */}
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[#8899AA] hover:text-danger hover:bg-danger/5 transition-colors">
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-1.5 rounded-lg text-[#556677] hover:text-white hover:bg-swed-surface transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
