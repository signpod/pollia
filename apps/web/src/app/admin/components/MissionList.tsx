"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import React from "react";
import { ADMIN_ROUTES } from "../constants/routes";
import { useAdminMissions } from "../hooks/mission";
import { BADGE_COLORS } from "../lib/badge-colors";
import { stripHtmlTags } from "../lib/utils";
import { AdminCard } from "./common/organisms/AdminCard";
import { AdminCreateCard } from "./common/organisms/AdminCreateCard";
import { Button } from "./shadcn-ui/button";
import { Card, CardContent, CardHeader } from "./shadcn-ui/card";
import { Skeleton } from "./shadcn-ui/skeleton";

export function MissionList() {
  const { missions, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useAdminMissions();

  if (isLoading) {
    return <MissionListSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdminCreateCard
          title="새 미션 만들기"
          description="클릭하여 미션을 생성하세요"
          href={ADMIN_ROUTES.ADMIN_MISSION_CREATE}
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

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "로딩 중..." : "더 보기"}
          </Button>
        </div>
      )}
    </div>
  );
}

function MissionListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: i is used as the key
        <Card key={i} className="h-[180px]">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
