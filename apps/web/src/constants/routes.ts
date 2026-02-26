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
  CREATE_MISSION: "/create",
  ME: "/me",
  ME_IN_PROGRESS: "/me/in-progress",
  ME_COMPLETED: "/me/completed",
  ME_REWARDS_PENDING: "/me/rewards/pending",
  ME_REWARDS_PAID: "/me/rewards/paid",
  ME_ACCOUNT: "/me/account",
  ME_ACCOUNT_EDIT: "/me/account/edit",
  ME_ACCOUNT_WITHDRAW: "/me/account/withdraw",
  ME_PARTNERSHIP: "/me/partnership",
  ME_COMPLETED_TAB: "/me?tab=completed",
  ME_REWARDS_TAB: "/me?tab=rewards",
  ME_LIKED_TAB: "/me?tab=liked",
  LIKES: "/likes",

  // 미션 관련
  MISSION: (id: string) => `/mission/${id}`,
  MISSION_DONE: (id: string, completionId?: string) =>
    completionId ? `/mission/${id}/done?id=${completionId}` : `/mission/${id}/done`,
  MISSION_PASSWORD: (missionId: string) => `/mission/${missionId}/password`,
  MISSION_MANAGE_ACTIONS: (missionId: string) => `/mission/${missionId}/manage/actions`,
  MISSION_MANAGE_ACTIONS_NEW: (missionId: string) => `/mission/${missionId}/manage/actions/new`,
  MISSION_MANAGE_ACTIONS_EDIT: (missionId: string, actionId: string) =>
    `/mission/${missionId}/manage/actions/${actionId}/edit`,

  // 액션 관련
  ACTION: ({ missionId, actionId }: { missionId: string; actionId: string }) =>
    `/mission/${missionId}/action/${actionId}`,
  ACTION_CREATE_DONE: "/mission/action/create/done",

  MISSION_ACTION_PREVIEW: (missionId: string, actionId: string) =>
    `/preview/action/${missionId}/${actionId}`,
  MISSION_COMPLETION_PREVIEW: (missionId: string, completionId: string) =>
    `/preview/completion/${missionId}/${completionId}`,
} as const;

export type Routes = typeof ROUTES;
