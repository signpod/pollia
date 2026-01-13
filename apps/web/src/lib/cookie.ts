/**
 * 클라이언트 전용 쿠키 유틸리티 함수
 *
 * 주의: 이 파일의 모든 함수는 클라이언트 컴포넌트에서만 사용 가능합니다.
 * 서버 컴포넌트에서는 사용할 수 없습니다.
 * 서버에서 쿠키를 다루려면 Next.js의 cookies() 함수를 사용하세요.
 */

import { ACTION_NAV_COOKIE_PREFIX, AUTH_ERROR_COOKIE_NAME } from "@/constants/cookie";

/**
 * 로그인 후 돌아갈 경로를 쿠키에 저장
 * @param path - 저장할 경로 (pathname + search)
 */
export function setAuthRedirect(path: string): void {
  // 15분 (900초) 동안 유효
  document.cookie = `auth_redirect=${path}; path=/; max-age=900; SameSite=Lax`;
}

/**
 * 현재 URL을 로그인 후 redirect 경로로 저장
 */
export function setCurrentUrlAsRedirect(): void {
  const currentPath = window.location.pathname + window.location.search;
  setAuthRedirect(currentPath);
}

/**
 * auth_redirect 쿠키 값을 가져옴
 * @returns redirect 경로 또는 null
 */
export function getAuthRedirect(): string | null {
  const cookies = document.cookie.split("; ");
  const authCookie = cookies.find(cookie => cookie.startsWith("auth_redirect="));

  if (!authCookie) {
    return null;
  }

  return authCookie.split("=")[1] || null;
}

/**
 * auth_redirect 쿠키를 삭제
 */
export function clearAuthRedirect(): void {
  document.cookie = "auth_redirect=; path=/; max-age=0";
}

export interface AuthError {
  type: string;
  message: string;
  detail?: string;
  timestamp: number;
}

export function getAuthErrorFromCookie(): AuthError | null {
  const cookies = document.cookie.split("; ");
  const authErrorCookie = cookies.find(c => c.startsWith(`${AUTH_ERROR_COOKIE_NAME}=`));

  if (!authErrorCookie) return null;

  try {
    const value = authErrorCookie.split("=").slice(1).join("=");
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return null;
  }
}

export function clearAuthErrorCookie(): void {
  document.cookie = `${AUTH_ERROR_COOKIE_NAME}=; path=/; max-age=0`;
}

/**
 * 액션 네비게이션 쿠키 설정 (클라이언트)
 * @param missionId - 미션 ID
 * @param value - "initial", "resume", 또는 actionId
 */
export function setActionNavCookie(missionId: string, value: string): void {
  document.cookie = `${ACTION_NAV_COOKIE_PREFIX}${missionId}=${value}; path=/; max-age=86400; SameSite=Lax`;
}

/**
 * 액션 네비게이션 쿠키 조회 (클라이언트)
 * @param missionId - 미션 ID
 * @returns 쿠키 값 또는 null
 */
export function getActionNavCookie(missionId: string): string | null {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find(c => c.startsWith(`${ACTION_NAV_COOKIE_PREFIX}${missionId}=`));

  if (!cookie) {
    return null;
  }

  return cookie.split("=")[1] || null;
}
