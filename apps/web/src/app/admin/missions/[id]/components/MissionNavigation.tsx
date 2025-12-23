"use client";

import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import { cn } from "@/app/admin/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface MissionNavigationProps {
  missionId: string;
}

interface NavLinkProps {
  href: string;
  isActive: boolean;
  children: ReactNode;
}

function NavLink({ href, isActive, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors",
        "border-b-2 -mb-px",
        isActive
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
      )}
    >
      {children}
    </Link>
  );
}

export function MissionNavigation({ missionId }: MissionNavigationProps) {
  const pathname = usePathname();
  const isDetailPage = pathname === ADMIN_ROUTES.ADMIN_MISSION(missionId);
  const isEditPage = pathname === ADMIN_ROUTES.ADMIN_MISSION_EDIT(missionId);
  const isTrackingPage = pathname === ADMIN_ROUTES.ADMIN_MISSION_TRACKING(missionId);
  const isPasswordPage = pathname === ADMIN_ROUTES.ADMIN_MISSION_PASSWORD(missionId);

  return (
    <nav className="flex gap-1 border-b">
      <NavLink href={ADMIN_ROUTES.ADMIN_MISSION(missionId)} isActive={isDetailPage}>
        상세
      </NavLink>
      <NavLink href={ADMIN_ROUTES.ADMIN_MISSION_TRACKING(missionId)} isActive={isTrackingPage}>
        통계
      </NavLink>
      <NavLink href={ADMIN_ROUTES.ADMIN_MISSION_EDIT(missionId)} isActive={isEditPage}>
        편집
      </NavLink>
      <NavLink href={ADMIN_ROUTES.ADMIN_MISSION_PASSWORD(missionId)} isActive={isPasswordPage}>
        비밀번호
      </NavLink>
    </nav>
  );
}
