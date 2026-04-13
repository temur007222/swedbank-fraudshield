"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LiveDemoToggle } from "@/components/shared/LiveDemoToggle";
import { Menu, ChevronRight } from "lucide-react";

interface HeaderProps {
  title: string;
  isLive: boolean;
  onToggleDemo: (live: boolean) => void;
  user: { name?: string | null; role: string };
}

function useBreadcrumbs(): Array<{ label: string; href: string }> {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((seg, i) => ({
    label: seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));
}

export function Header({
  title,
  isLive,
  onToggleDemo,
  user,
}: HeaderProps) {
  const breadcrumbs = useBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 bg-swed-dark/80 backdrop-blur-md border-b border-swed-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: mobile menu + title + breadcrumbs */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-[#8899AA] hover:text-white hover:bg-swed-surface transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 mb-0.5">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1">
                  {i > 0 && (
                    <ChevronRight className="h-3 w-3 text-[#556677]" />
                  )}
                  <span
                    className={cn(
                      "text-[11px]",
                      i === breadcrumbs.length - 1
                        ? "text-[#8899AA]"
                        : "text-[#556677]"
                    )}
                  >
                    {crumb.label}
                  </span>
                </span>
              ))}
            </nav>
            <h1 className="text-lg font-semibold text-white leading-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Right: live toggle + user info */}
        <div className="flex items-center gap-4">
          <LiveDemoToggle isLive={isLive} onToggle={onToggleDemo} />

          <div className="hidden sm:flex items-center gap-2.5 pl-4 border-l border-swed-border">
            <div className="h-8 w-8 rounded-full bg-swed-orange/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-swed-orange">
                {(user.name || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-white leading-tight">
                {user.name || "User"}
              </p>
              <p className="text-[10px] text-[#556677]">
                {user.role.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
