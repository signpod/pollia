import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 고유한 ID를 생성합니다.
 * crypto.randomUUID()를 우선 사용하고, 지원되지 않는 환경에서는 fallback 방식을 사용합니다.
 * @returns 고유한 문자열 ID
 */
export function generateUniqueId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: timestamp + random number
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomPart}`;
}

// 시간 포맷팅 함수 (00일 00:00 형식)
export function formatTimeRemainingInDays(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400); // 86400 = 24 * 60 * 60
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${days.toString().padStart(2, "0")}일 ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function getPollStatus(
  startDate: Date | null,
  endDate: Date | null,
  _isIndefinite: boolean,
  currentTime: Date = new Date(),
): "before" | "active" | "after" {
  const now = currentTime.getTime();
  const startTime = startDate ? startDate.getTime() : 0;
  const endTime = endDate ? endDate.getTime() : Number.POSITIVE_INFINITY;

  if (startDate && now < startTime) return "before";

  if (endDate && now >= endTime) return "after";

  return "active";
}

export function isPollActive(
  startDate: Date | null,
  endDate: Date | null,
  isIndefinite: boolean,
  currentTime: Date = new Date(),
): boolean {
  return getPollStatus(startDate, endDate, isIndefinite, currentTime) === "active";
}

export function getPollStatusMessage(
  startDate: Date | null,
  endDate: Date | null,
  isIndefinite: boolean,
  currentTime: Date = new Date(),
): string {
  const status = getPollStatus(startDate, endDate, isIndefinite, currentTime);

  if (status === "after") {
    return "종료되었어요";
  }

  if (isIndefinite) {
    return "종료없이 진행되는 투표에요";
  }

  const now = currentTime.getTime();

  if (status === "before" && startDate) {
    const timeUntilStart = startDate.getTime() - now;
    return `${formatTimeRemainingInDays(timeUntilStart)} 뒤에 만나요`;
  }

  if (status === "active" && endDate) {
    const timeRemaining = endDate.getTime() - now;
    return `${formatTimeRemainingInDays(timeRemaining)} 뒤에 끝나요`;
  }

  return "";
}
