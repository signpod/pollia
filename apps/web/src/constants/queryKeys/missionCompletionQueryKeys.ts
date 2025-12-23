export const missionCompletionQueryKeys = {
  all: () => ["mission-completion"] as const,
  missionCompletion: (missionId: string) => ["mission-completion", missionId] as const,
} as const;

export type MissionCompletionQueryKeys = typeof missionCompletionQueryKeys;
