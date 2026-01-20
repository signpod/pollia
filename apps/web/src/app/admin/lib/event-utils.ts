import type { Event } from "@prisma/client";
import { isAfter, isBefore } from "date-fns";
import { BADGE_COLORS } from "./badge-colors";

export interface EventStatus {
  label: string;
  color: string;
}

export function getEventStatus(event: Event): EventStatus {
  const now = new Date();

  if (!event.startDate || !event.endDate) {
    return {
      label: "기간 미설정",
      color: BADGE_COLORS.unset,
    };
  }

  const isOngoing = !isBefore(now, event.startDate) && !isAfter(now, event.endDate);
  const isUpcoming = isBefore(now, event.startDate);
  const isEnded = isAfter(now, event.endDate);

  if (isOngoing) {
    return {
      label: "진행중",
      color: BADGE_COLORS.ongoing,
    };
  }

  if (isUpcoming) {
    return {
      label: "예정",
      color: BADGE_COLORS.upcoming,
    };
  }

  if (isEnded) {
    return {
      label: "마감",
      color: BADGE_COLORS.ended,
    };
  }

  return {
    label: "기간 미설정",
    color: BADGE_COLORS.unset,
  };
}
