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

const ACTION_NAV_COOKIE_PREFIX = "action_nav_";

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
