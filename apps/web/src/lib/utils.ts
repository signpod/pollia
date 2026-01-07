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

/**
 * 밀리초를 한글 시간 형식으로 변환합니다.
 * 의미있는 단위만 표시하며, 최대 2개의 단위까지 표시합니다.
 *
 * @param ms - 변환할 밀리초
 * @returns 한글 시간 문자열
 *
 * @example
 * formatMillisecondsToKorean(1000) // "1초"
 * formatMillisecondsToKorean(65000) // "1분 5초"
 * formatMillisecondsToKorean(3665000) // "1시간 1분"
 * formatMillisecondsToKorean(90000000) // "1일 1시간"
 */
export function formatMillisecondsToKorean(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);

  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}일`);
  }
  if (hours > 0) {
    parts.push(`${hours}시간`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}분`);
  }
  if (seconds > 0) {
    parts.push(`${seconds}초`);
  }

  if (parts.length === 0) {
    return "0초";
  }

  // 최대 2개의 단위만 표시 (가독성을 위해)
  return parts.slice(0, 2).join(" ");
}

/**
 * TipTap 에디터에서 생성된 HTML을 정리합니다.
 * - 불필요한 속성 제거 (contenteditable, translate)
 * - ProseMirror 관련 클래스 및 태그 제거
 * - 빈 태그 제거
 * @param html 정리할 HTML 문자열
 * @returns 정리된 HTML 문자열
 */
export function cleanTiptapHTML(html: string): string {
  if (!html) return "";

  let cleaned = html;

  // 빈 class 속성 제거
  cleaned = cleaned.replace(/\s*class=""\s*/g, " ");

  // ProseMirror-trailingBreak 제거
  cleaned = cleaned.replace(/<br[^>]*class="[^"]*ProseMirror-trailingBreak[^"]*"[^>]*>/g, "");

  // 빈 태그 제거 (단, <br>은 유지)
  cleaned = cleaned.replace(/<p>\s*<\/p>/g, "");
  cleaned = cleaned.replace(/<div>\s*<\/div>/g, "");

  // 연속된 공백 정리
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

/**
 * 바이트를 읽기 쉬운 파일 크기 문자열로 변환합니다.
 * @param bytes - 변환할 바이트 수
 * @returns 포맷된 파일 크기 문자열 (예: "1.5 MB", "500 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}
