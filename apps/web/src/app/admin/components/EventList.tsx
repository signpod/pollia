"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Card, CardContent, CardHeader } from "@/app/admin/components/shadcn-ui/card";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import { useAdminEvents } from "@/app/admin/hooks/event";
import UBQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useState } from "react";
import { EventCard } from "./EventCard";
import { EventCreateModal } from "./EventCreateModal";
import { AdminCreateCard } from "./common/organisms/AdminCreateCard";

export function EventList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { events, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useAdminEvents();

  if (isLoading) {
    return <EventListSkeleton />;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AdminCreateCard
            title={`새 ${UBQUITOUS_CONSTANTS.EVENT} 만들기`}
            description={`${UBQUITOUS_CONSTANTS.EVENT}을 생성하고 ${UBQUITOUS_CONSTANTS.MISSION}을 관리하세요`}
            onClick={() => setIsCreateModalOpen(true)}
          />

          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {hasNextPage && (
          <div className="flex justify-center pt-4">
            <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} variant="outline">
              {isFetchingNextPage ? "로딩 중..." : "더 보기"}
            </Button>
          </div>
        )}
      </div>

      <EventCreateModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </>
  );
}

function EventListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="h-[180px]">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
