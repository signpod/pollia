"use client";

import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import type { Event } from "@prisma/client";
import { format, isAfter, isBefore } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarDays, CheckCircle } from "lucide-react";
import React from "react";
import { AdminCard } from "./common/organisms/AdminCard";

interface EventCardProps {
  event: Event & { missions?: { id: string }[] };
}

function getEventStatus(event: Event) {
  const now = new Date();

  if (!event.startDate || !event.endDate) {
    return {
      label: "기간 미설정",
      variant: "secondary" as const,
      color: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
    };
  }

  const isOngoing = !isBefore(now, event.startDate) && !isAfter(now, event.endDate);
  const isUpcoming = isBefore(now, event.startDate);
  const isEnded = isAfter(now, event.endDate);

  if (isOngoing) {
    return {
      label: "진행중",
      variant: "default" as const,
      color:
        "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-500/20",
    };
  }
  if (isUpcoming) {
    return {
      label: "예정",
      variant: "secondary" as const,
      color:
        "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 hover:bg-blue-500/20",
    };
  }
  if (isEnded) {
    return {
      label: "마감",
      variant: "secondary" as const,
      color: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
    };
  }

  return {
    label: "기간 미설정",
    variant: "secondary" as const,
    color: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
  };
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
      statusBadge={status}
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
