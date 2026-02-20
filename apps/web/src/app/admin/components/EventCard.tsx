"use client";

import { ADMIN_ROUTES } from "@/app/admin/constants/routes";
import { formatDateRange } from "@/app/admin/lib/date-utils";
import { getEventStatus } from "@/app/admin/lib/event-utils";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import type { Event } from "@prisma/client";
import { CalendarDays, CheckCircle } from "lucide-react";
import React from "react";
import { AdminCard } from "./common/organisms/AdminCard";

interface EventCardProps {
  event: Event & { missions?: { id: string }[] };
}

export function EventCard({ event }: EventCardProps) {
  const status = getEventStatus(event);
  const missionCount = event.missions?.length ?? 0;

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
          <span>{formatDateRange(event.startDate, event.endDate)}</span>
        </React.Fragment>,
        <React.Fragment key="missions">
          <CheckCircle className="size-4" />
          <span>
            {UBIQUITOUS_CONSTANTS.MISSION} {missionCount}개
          </span>
        </React.Fragment>,
      ]}
    />
  );
}
