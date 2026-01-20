import { format } from "date-fns";
import { ko } from "date-fns/locale";

export function formatDateRange(startDate: Date | null, endDate: Date | null): string {
  if (!startDate || !endDate) {
    return "기간 미설정";
  }

  const start = format(new Date(startDate), "yyyy년 M월 d일", { locale: ko });
  const end = format(new Date(endDate), "yyyy년 M월 d일", { locale: ko });

  return `${start} ~ ${end}`;
}
