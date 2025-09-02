"use client";

import { useState, useEffect } from "react";
import { Clock, Timer } from "lucide-react";
import { TimeRemaining } from "@/types/poll";

interface CountdownTimerProps {
  endAt: string;
  isActive?: boolean;
}

export function CountdownTimer({
  endAt,
  isActive = true,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
    null
  );

  useEffect(() => {
    const calculateTimeRemaining = (): TimeRemaining => {
      const now = new Date().getTime();
      const endDate = new Date(endAt).getTime();
      const distance = endDate - now;

      if (distance > 0) {
        return {
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
          isExpired: false,
        };
      } else {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
      }
    };

    // 초기 계산
    setTimeRemaining(calculateTimeRemaining());

    // 1초마다 업데이트
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [endAt]);

  if (!timeRemaining || !isActive) {
    return null;
  }

  const formatTimeUnit = (value: number, unit: string) => {
    if (value === 0) return null;
    return `${value}${unit}`;
  };

  const timeString = () => {
    if (timeRemaining.isExpired) {
      return "투표가 종료되었습니다";
    }

    const parts = [
      formatTimeUnit(timeRemaining.days, "일"),
      formatTimeUnit(timeRemaining.hours, "시간"),
      formatTimeUnit(timeRemaining.minutes, "분"),
      formatTimeUnit(timeRemaining.seconds, "초"),
    ].filter(Boolean);

    if (parts.length === 0) {
      return "잠시 후 종료";
    }

    return `${parts.join(" ")} 남음`;
  };

  const getTimerColor = () => {
    if (timeRemaining.isExpired) {
      return "text-gray-500";
    }

    const totalMinutes =
      timeRemaining.days * 24 * 60 +
      timeRemaining.hours * 60 +
      timeRemaining.minutes;

    if (totalMinutes < 60) {
      return "text-red-600";
    } else if (totalMinutes < 24 * 60) {
      return "text-orange-600";
    } else {
      return "text-green-600";
    }
  };

  const TimerIcon = timeRemaining.isExpired ? Clock : Timer;

  return (
    <div
      className={`flex items-center gap-2 text-sm font-medium ${getTimerColor()} my-4`}
    >
      <TimerIcon className="w-4 h-4" />
      <span>{timeString()}</span>

      {!timeRemaining.isExpired &&
        timeRemaining.days === 0 &&
        timeRemaining.hours === 0 &&
        timeRemaining.minutes < 30 && (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
    </div>
  );
}
