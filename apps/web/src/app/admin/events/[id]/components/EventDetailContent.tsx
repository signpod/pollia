"use client";

import { AdminEventHeader } from "@/app/admin/components/AdminEventHeader";
import { EventEditModal } from "@/app/admin/components/EventEditModal";
import { EventMissionList } from "@/app/admin/components/EventMissionList";
import { useAdminEventWithMissions } from "@/app/admin/hooks/event";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useState } from "react";

interface EventDetailContentProps {
  eventId: string;
}

export function EventDetailContent({ eventId }: EventDetailContentProps) {
  const { event, isLoading } = useAdminEventWithMissions(eventId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">{UBIQUITOUS_CONSTANTS.EVENT}을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <AdminEventHeader event={event} onEdit={() => setIsEditModalOpen(true)} />
        <EventMissionList eventId={eventId} missions={event.missions} />
      </div>

      <EventEditModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} event={event} />
    </>
  );
}
