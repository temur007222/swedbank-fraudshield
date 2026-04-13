"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { DashboardProvider, useDashboard } from "@/lib/dashboard-context";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { isLive, setIsLive } = useDashboard();

  if (!session) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-swed-dark">
      <Sidebar role={session.user.role} />
      <div className="flex flex-1 flex-col overflow-hidden ml-56">
        <Header
          title="FraudShield AI"
          isLive={isLive}
          onToggleDemo={() => setIsLive(!isLive)}
          user={session.user}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-swed-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-swed-orange border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#8899AA]">Loading session...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    router.replace("/login");
    return null;
  }

  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
