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
