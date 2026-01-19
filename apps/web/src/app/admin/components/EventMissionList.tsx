"use client";

import { AdminCard } from "@/app/admin/components/common/organisms/AdminCard";
import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import { stripHtmlTags } from "@/app/admin/lib/utils";
import type { Mission } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import React from "react";

interface EventMissionListProps {
  missions: Mission[];
}

export function EventMissionList({ missions }: EventMissionListProps) {
  if (missions.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">미션</h2>
          <p className="text-muted-foreground">이 이벤트에 속한 미션 목록입니다.</p>
        </div>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">이 이벤트에 속한 미션이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">미션 ({missions.length})</h2>
        <p className="text-muted-foreground">이 이벤트에 속한 미션 목록입니다.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {missions.map(mission => (
          <AdminCard
            key={mission.id}
            title={mission.title}
            description={mission.description ? stripHtmlTags(mission.description) : undefined}
            href={ADMIN_ROUTES.ADMIN_MISSION(mission.id)}
            statusBadge={{
              label: mission.isActive ? "활성" : "비활성",
              variant: mission.isActive ? "default" : "secondary",
              color: mission.isActive
                ? "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-500/20"
                : "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
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
