/**
 * 애플리케이션 라우트 경로 상수
 */
export const ROUTES = {
  // 인증 관련
  LOGIN: "/login",
  AUTH_CALLBACK: "/auth/callback",
  AUTH_CODE_ERROR: "/auth/auth-code-error",

  // 메인 페이지
  HOME: "/",
  ME: "/me",

  // 설문 관련
  MISSION: (id: string) => `/mission/${id}`,
  MISSION_DONE: (id: string) => `/mission/${id}/done`,
  ACTION: (actionId: string) => `/action/${actionId}`,
  MISSION_CREATE: "/mission/create",
  ACTION_CREATE: "/mission/action/create",
  ACTION_CREATE_DONE: "/mission/action/create/done",
} as const;

export type Routes = typeof ROUTES;
