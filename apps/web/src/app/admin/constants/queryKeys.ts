export const adminMissionQueryKeys = {
  all: () => ["admin", "mission"] as const,
  mission: (missionId: string) => ["admin", "mission", missionId] as const,
  missions: (params?: { limit?: number; sortOrder?: string }) =>
    ["admin", "missions", params] as const,
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
