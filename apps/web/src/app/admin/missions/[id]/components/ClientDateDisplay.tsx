"use client";

import { useEffect, useState } from "react";

interface ClientDateDisplayProps {
  date: Date | string;
  format?: "date" | "datetime";
}

export function ClientDateDisplay({ date, format = "datetime" }: ClientDateDisplayProps) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const dateObj = new Date(date);

    if (format === "date") {
      setFormattedDate(
        dateObj.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    } else {
      setFormattedDate(
        dateObj.toLocaleString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }
  }, [date, format]);

  if (!formattedDate) {
    return <span className="text-muted-foreground">-</span>;
  }

  return <span>{formattedDate}</span>;
}
