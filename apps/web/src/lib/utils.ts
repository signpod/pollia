import { clsx, type ClassValue } from "clsx";
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

// 시간 포맷팅 함수 (HH:MM:SS 또는 HHH:MM:SS)
export function formatTimeRemaining(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const totalHours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hoursStr =
    totalHours >= 100
      ? totalHours.toString()
      : totalHours.toString().padStart(2, "0");

  return `${hoursStr}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// 남은 시간 계산 함수
export function calculateTimeRemaining(
  startDate: Date | null,
  endDate: Date | null,
  isIndefinite: boolean,
  currentTime: Date = new Date()
): {
  isExpired: boolean;
  isIndefinite: boolean;
  isNotStarted: boolean;
  timeRemaining: number;
  displayText: string;
} {
  if (isIndefinite || !endDate) {
    return {
      isExpired: false,
      isIndefinite: true,
      isNotStarted: false,
      timeRemaining: 0,
      displayText: "무기한으로 진행되는 투표에요.",
    };
  }

  const startTime = startDate ? startDate.getTime() : 0;
  const endTime = endDate.getTime();
  const currentTimeMs = currentTime.getTime();

  // 아직 시작되지 않은 경우
  if (startDate && currentTimeMs < startTime) {
    const timeUntilStart = startTime - currentTimeMs;
    return {
      isExpired: false,
      isIndefinite: false,
      isNotStarted: true,
      timeRemaining: timeUntilStart,
      displayText: `${formatTimeRemaining(timeUntilStart)} 후에 시작해요`,
    };
  }

  // 종료된 경우
  if (currentTimeMs >= endTime) {
    return {
      isExpired: true,
      isIndefinite: false,
      isNotStarted: false,
      timeRemaining: 0,
      displayText: "종료됨",
    };
  }

  // 진행 중인 경우
  const timeRemaining = endTime - currentTimeMs;
  return {
    isExpired: false,
    isIndefinite: false,
    isNotStarted: false,
    timeRemaining,
    displayText: `${formatTimeRemaining(timeRemaining)} 뒤에 끝나요`,
  };
}

// 투표 활성화 상태 확인
export function isPollActive(
  startDate: Date | null,
  endDate: Date | null,
  isIndefinite: boolean,
  currentTime: Date = new Date()
): boolean {
  if (isIndefinite) return true;

  const now = currentTime.getTime();
  const startTime = startDate ? startDate.getTime() : 0;
  const endTime = endDate ? endDate.getTime() : Infinity;

  // 시작 전
  if (startDate && now < startTime) return false;

  // 종료 후
  if (endDate && now >= endTime) return false;

  return true;
}
