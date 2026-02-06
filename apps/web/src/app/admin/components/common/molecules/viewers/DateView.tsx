"use client";

import { cn } from "@/app/admin/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

type DateFormat = "date" | "datetime" | "relative";

interface DateViewProps {
  value?: Date | string | null;
  dateFormat?: DateFormat;
  placeholder?: string;
  className?: string;
}

export function DateView({
  value,
  dateFormat = "datetime",
  placeholder = "미설정",
  className,
}: DateViewProps) {
  if (!value) {
    return <span className="text-muted-foreground">{placeholder}</span>;
  }

  const date = typeof value === "string" ? new Date(value) : value;

  const formatDate = () => {
    switch (dateFormat) {
      case "date":
        return format(date, "yyyy.MM.dd", { locale: ko });
      case "datetime":
        return format(date, "yyyy.MM.dd HH:mm", { locale: ko });
      case "relative":
        return formatDistanceToNow(date, { addSuffix: true, locale: ko });
      default:
        return format(date, "yyyy.MM.dd HH:mm", { locale: ko });
    }
  };

  return <span className={cn("tabular-nums", className)}>{formatDate()}</span>;
}
