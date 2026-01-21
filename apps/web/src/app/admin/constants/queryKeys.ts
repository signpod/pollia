export const adminMissionQueryKeys = {
  all: () => ["admin", "mission"] as const,
  mission: (missionId: string) => ["admin", "mission", missionId] as const,
  missions: (params?: { limit?: number; sortOrder?: string }) =>
    params ? (["admin", "missions", params] as const) : (["admin", "missions"] as const),
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
  all: () => ["admin", "event"] as const,
  events: (params?: { limit?: number; sortOrder?: string }) =>
    params ? (["admin", "events", params] as const) : (["admin", "events"] as const),
  event: (eventId: string) => ["admin", "event", eventId] as const,
  eventWithMissions: (eventId: string) => ["admin", "event", eventId, "missions"] as const,
} as const;

export type AdminEventQueryKeys = typeof adminEventQueryKeys;
