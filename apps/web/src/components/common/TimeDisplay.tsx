"use client";

import { useState, useEffect } from "react";
import { calculateTimeRemaining } from "@/lib/utils";
import { Typo } from "@repo/ui/components";

interface TimeDisplayProps {
  startDate: Date | null;
  endDate: Date | null;
  isIndefinite: boolean;
}

export function TimeDisplay({
  startDate,
  endDate,
  isIndefinite,
}: TimeDisplayProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // 클라이언트에서만 시간 설정하여 hydration 에러 방지
    setCurrentTime(new Date());

    if (!endDate || isIndefinite) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate, isIndefinite]);

  if (!currentTime) {
    return <div className="h-5 text-zinc-400  rounded-sm" />;
  }

  const timeStatus = calculateTimeRemaining(
    startDate,
    endDate,
    isIndefinite,
    currentTime
  );

  return (
    <Typo.Body
      size="medium"
      className={
        timeStatus.isExpired
          ? "text-red-500"
          : timeStatus.isIndefinite
            ? "text-green-500"
            : timeStatus.isNotStarted
              ? "text-blue-500"
              : "text-zinc-400"
      }
    >
      {timeStatus.displayText}
    </Typo.Body>
  );
}
