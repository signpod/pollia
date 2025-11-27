/**
 * 애플리케이션 라우트 경로 상수
 */
export const ROUTES = {
  // 관리자 관련
  ADMIN: "/admin",
  ADMIN_LOGIN: "/admin/login",

  // 인증 관련
  LOGIN: "/login",
  AUTH_CALLBACK: "/auth/callback",
  AUTH_CODE_ERROR: "/auth/auth-code-error",

  // 메인 페이지
  HOME: "/",
  ME: "/me",

  // 투표 관련
  POLL: (id: string) => `/poll/${id}`,
  POLL_CREATE: "/poll/create",
  POLL_CREATE_DONE: "/poll/create/done",

  // 설문 관련
  SURVEY: (id: string) => `/survey/${id}`,
  SURVEY_DONE: (id: string) => `/survey/${id}/done`,
  SURVEY_QUESTION: (questionId: string) => `/survey-question/${questionId}`,
  SURVEY_CREATE: "/survey/create",
  SURVEY_QUESTION_CREATE: "/survey/question/create",
  SURVEY_QUESTION_CREATE_DONE: "/survey/question/create/done",
} as const;

export type Routes = typeof ROUTES;
