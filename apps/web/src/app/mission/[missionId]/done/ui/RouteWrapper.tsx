"use client";

import { ROUTES } from "@/constants/routes";
import { usePreventBack } from "@/hooks/common/usePreventBack";
import { useParams } from "next/navigation";
import type { PropsWithChildren } from "react";

export function RouteWrapper({ children }: PropsWithChildren) {
  const { missionId } = useParams<{ missionId: string }>();

  usePreventBack({
    enabled: true,
    redirectTo: ROUTES.MISSION(missionId),
    currentPath: ROUTES.MISSION_DONE(missionId),
  });

  return <>{children}</>;
}
