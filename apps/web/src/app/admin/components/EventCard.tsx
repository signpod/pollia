"use client";

import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import { getEventStatus } from "@/app/admin/lib/event-utils";
import type { Event } from "@prisma/client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarDays, CheckCircle } from "lucide-react";
import React from "react";
import { AdminCard } from "./common/organisms/AdminCard";

interface EventCardProps {
  event: Event & { missions?: { id: string }[] };
}

export function EventCard({ event }: EventCardProps) {
  const status = getEventStatus(event);
  const missionCount = event.missions?.length ?? 0;

  const formatDateRange = () => {
    if (!event.startDate || !event.endDate) {
      return "기간 미설정";
    }

    const start = format(new Date(event.startDate), "yyyy.MM.dd", { locale: ko });
    const end = format(new Date(event.endDate), "yyyy.MM.dd", { locale: ko });

    return `${start} ~ ${end}`;
  };

  return (
    <AdminCard
      title={event.title}
      description={event.description ?? undefined}
      href={ADMIN_ROUTES.ADMIN_EVENT(event.id)}
      statusBadge={{
        label: status.label,
        variant: status.label === "진행중" ? "default" : "secondary",
        color: status.color,
      }}
      bottomInfo={[
        <React.Fragment key="date">
          <CalendarDays className="size-4" />
          <span>{formatDateRange()}</span>
        </React.Fragment>,
        <React.Fragment key="missions">
          <CheckCircle className="size-4" />
          <span>미션 {missionCount}개</span>
        </React.Fragment>,
      ]}
    />
  );
}
