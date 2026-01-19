"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Card, CardContent, CardHeader } from "@/app/admin/components/shadcn-ui/card";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import { useAdminEvents } from "@/app/admin/hooks/event";
import { useState } from "react";
import { AdminCreateCard } from "./AdminCreateCard";
import { EventCard } from "./EventCard";
import { EventCreateModal } from "./EventCreateModal";

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
          <button type="button" onClick={() => setIsCreateModalOpen(true)} className="text-left">
            <AdminCreateCard
              title="새 이벤트 만들기"
              description="이벤트를 생성하고 미션을 관리하세요"
              href="#"
            />
          </button>

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
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
