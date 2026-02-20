"use client";

import { AdminCard } from "@/app/admin/components/common/organisms/AdminCard";
import { AdminCreateCard } from "@/app/admin/components/common/organisms/AdminCreateCard";
import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import { BADGE_COLORS } from "@/app/admin/lib/badge-colors";
import { stripHtmlTags } from "@/app/admin/lib/utils";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import type { Mission } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface EventMissionListProps {
  eventId: string;
  missions: Mission[];
}

export function EventMissionList({ eventId, missions }: EventMissionListProps) {
  const router = useRouter();

  const handleCreateMission = () => {
    router.push(`${ADMIN_ROUTES.ADMIN_MISSION_CREATE}?eventId=${eventId}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {UBIQUITOUS_CONSTANTS.MISSION} ({missions.length})
        </h2>
        <p className="text-muted-foreground">
          이 {UBIQUITOUS_CONSTANTS.EVENT}에 속한 {UBIQUITOUS_CONSTANTS.MISSION} 목록입니다.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdminCreateCard
          onClick={handleCreateMission}
          label={`${UBIQUITOUS_CONSTANTS.MISSION} 추가`}
        />
        {missions.map(mission => (
          <AdminCard
            key={mission.id}
            title={mission.title}
            description={mission.description ? stripHtmlTags(mission.description) : undefined}
            href={ADMIN_ROUTES.ADMIN_MISSION(mission.id)}
            statusBadge={{
              label: mission.isActive ? "활성" : "비활성",
              variant: mission.isActive ? "default" : "secondary",
              color: mission.isActive ? BADGE_COLORS.active : BADGE_COLORS.inactive,
            }}
            bottomInfo={[
              <React.Fragment key="date">
                <CalendarDays className="size-4" />
                <span>
                  {formatDistanceToNow(new Date(mission.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </React.Fragment>,
            ]}
          />
        ))}
      </div>
    </div>
  );
}
