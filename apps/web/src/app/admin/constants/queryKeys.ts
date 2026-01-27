export const adminMissionQueryKeys = {
  all: () => ["admin", "missions"] as const,
  list: (params?: { limit?: number; sortOrder?: string; category?: string }) =>
    params
      ? (["admin", "missions", "list", params] as const)
      : (["admin", "missions", "list"] as const),
  detail: (missionId: string) => ["admin", "missions", "detail", missionId] as const,
} as const;

export type AdminMissionQueryKeys = typeof adminMissionQueryKeys;

export const adminActionQueryKeys = {
  all: () => ["admin", "action"] as const,
  actions: (missionId: string) => ["admin", "actions", missionId] as const,
  action: (actionId: string) => ["admin", "action", actionId] as const,
} as const;

export type AdminActionQueryKeys = typeof adminActionQueryKeys;

export const adminRewardQueryKeys = {
  all: () => ["admin", "reward"] as const,
  reward: (rewardId: string) => ["admin", "reward", rewardId] as const,
} as const;

export type AdminRewardQueryKeys = typeof adminRewardQueryKeys;

export const adminMissionCompletionQueryKeys = {
  all: () => ["admin", "mission-completion"] as const,
  missionCompletion: (missionId: string) => ["admin", "mission-completion", missionId] as const,
} as const;

export type AdminMissionCompletionQueryKeys = typeof adminMissionCompletionQueryKeys;

export const trackingQueryKeys = {
  missionFunnel: (missionId: string) => ["admin", "mission-funnel", missionId] as const,
} as const;

export type TrackingQueryKeys = typeof trackingQueryKeys;

export const adminMissionResponseQueryKeys = {
  all: () => ["admin", "mission-response"] as const,
  responses: (missionId: string) => ["admin", "mission-response", "responses", missionId] as const,
} as const;

export type AdminMissionResponseQueryKeys = typeof adminMissionResponseQueryKeys;

export const submissionQueryKeys = {
  all: () => ["admin", "submission"] as const,
  list: (missionId: string) => ["admin", "submission", missionId] as const,
} as const;

export type SubmissionQueryKeys = typeof submissionQueryKeys;

export const adminEventQueryKeys = {
  all: () => ["admin", "events"] as const,
  list: (params?: { limit?: number; sortOrder?: string }) =>
    params
      ? (["admin", "events", "list", params] as const)
      : (["admin", "events", "list"] as const),
  detail: (eventId: string) => ["admin", "events", "detail", eventId] as const,
  detailWithMissions: (eventId: string) =>
    ["admin", "events", "detail", eventId, "missions"] as const,
} as const;

export type AdminEventQueryKeys = typeof adminEventQueryKeys;
