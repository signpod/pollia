export const missionCompletionQueryKeys = {
  all: () => ["mission-completion"] as const,
  missionCompletion: (missionId: string) => ["mission-completion", missionId] as const,
  missionCompletionById: (missionId: string, completionId: string) =>
    ["mission-completion", missionId, "by-id", completionId] as const,
} as const;

export type MissionCompletionQueryKeys = typeof missionCompletionQueryKeys;
