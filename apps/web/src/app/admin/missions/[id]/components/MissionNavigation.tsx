"use client";

import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import { cn } from "@/app/admin/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MissionNavigationProps {
  missionId: string;
}

export function MissionNavigation({ missionId }: MissionNavigationProps) {
  const pathname = usePathname();
  const isDetailPage = pathname === ADMIN_ROUTES.ADMIN_MISSION(missionId);
  const isEditPage = pathname === ADMIN_ROUTES.ADMIN_MISSION_EDIT(missionId);
  const isTrackingPage = pathname === ADMIN_ROUTES.ADMIN_MISSION_TRACKING(missionId);
  const isPasswordPage = pathname === ADMIN_ROUTES.ADMIN_MISSION_PASSWORD(missionId);

  return (
    <nav className="flex gap-1 border-b">
      <Link
        href={ADMIN_ROUTES.ADMIN_MISSION(missionId)}
        className={cn(
          "px-4 py-2 text-sm font-medium transition-colors",
          "border-b-2 -mb-px",
          isDetailPage
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
        )}
      >
        상세
      </Link>
      <Link
        href={ADMIN_ROUTES.ADMIN_MISSION_EDIT(missionId)}
        className={cn(
          "px-4 py-2 text-sm font-medium transition-colors",
          "border-b-2 -mb-px",
          isEditPage
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
        )}
      >
        편집
      </Link>
      <Link
        href={ADMIN_ROUTES.ADMIN_MISSION_PASSWORD(missionId)}
        className={cn(
          "px-4 py-2 text-sm font-medium transition-colors",
          "border-b-2 -mb-px",
          isPasswordPage
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
        )}
      >
        비밀번호
      </Link>
      <Link
        href={ADMIN_ROUTES.ADMIN_MISSION_TRACKING(missionId)}
        className={cn(
          "px-4 py-2 text-sm font-medium transition-colors",
          "border-b-2 -mb-px",
          isTrackingPage
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
        )}
      >
        사용자 추적
      </Link>
    </nav>
  );
}
