import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CDN_BASE_URL } from "@/constants/config";

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

/**
 * CDN 이미지 URL을 생성합니다.
 * @param imageUrl - 상대 경로 또는 절대 경로 이미지 URL
 * @returns 완전한 CDN 이미지 URL 또는 undefined
 */
export function getCdnImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;

  // 이미 완전한 URL인 경우 그대로 반환
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // 상대 경로인 경우 CDN_BASE_URL과 결합
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${CDN_BASE_URL}${cleanPath}`;
}
