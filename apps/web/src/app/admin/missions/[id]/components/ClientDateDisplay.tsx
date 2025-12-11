"use client";

import { formatDate } from "date-fns";
import { ko } from "date-fns/locale";
import { useMemo } from "react";

interface ClientDateDisplayProps {
  date: Date | string;
  format?: "date" | "datetime";
}

export function ClientDateDisplay({ date, format = "datetime" }: ClientDateDisplayProps) {
  const formattedDate = useMemo(() => {
    const dateObj = new Date(date);

    if (format === "date") {
      return formatDate(dateObj, "yyyy년 M월 d일", { locale: ko });
    }

    return formatDate(dateObj, "yyyy년 M월 d일 HH:mm", { locale: ko });
  }, [date, format]);

  return <span>{formattedDate}</span>;
}
