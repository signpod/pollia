"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarDays, Plus } from "lucide-react";
import Link from "next/link";
import { ADMIN_ROUTES } from "../constants/routes";
import { useAdminMissions } from "../hooks/use-admin-missions";
import { stripHtmlTags } from "../lib/utils";
import { Badge } from "./shadcn-ui/badge";
import { Button } from "./shadcn-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./shadcn-ui/card";
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
        <Link href={ADMIN_ROUTES.ADMIN_MISSION_CREATE}>
          <Card className="h-[180px] border-dashed border-2 hover:border-primary hover:bg-muted/30 transition-shadow cursor-pointer group">
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus className="size-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">새 미션 만들기</p>
                <p className="text-sm text-muted-foreground">클릭하여 미션을 생성하세요</p>
              </div>
            </div>
          </Card>
        </Link>
        {missions.map(mission => (
          <Link key={mission.id} href={ADMIN_ROUTES.ADMIN_MISSION(mission.id)}>
            <Card className="h-[180px] hover:shadow-md hover:bg-muted/30 transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-1">{mission.title}</CardTitle>
                {mission.description && (
                  <CardDescription className="line-clamp-2">
                    {stripHtmlTags(mission.description)}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4" />
                    <span>
                      {formatDistanceToNow(new Date(mission.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                  </div>
                  <Badge
                    variant={mission.isActive ? "default" : "secondary"}
                    className={
                      mission.isActive
                        ? "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-500/20"
                        : "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400"
                    }
                  >
                    {mission.isActive ? "활성" : "비활성"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
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
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
