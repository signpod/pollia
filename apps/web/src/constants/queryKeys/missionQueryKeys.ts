export const missionQueryKeys = {
  mission: (missionId: string) => ["mission", missionId] as const,
  missionResults: (missionId: string) => ["mission-results", missionId] as const,
  userAnswerStatus: (missionId: string) => ["user-answer-status", missionId] as const,
  userMissions: (userId?: string) =>
    userId ? (["user-missions", userId] as const) : (["user-missions"] as const),
  all: () => ["mission"] as const,
  missionResponseForMission: (missionId: string) =>
    ["mission-response-for-mission", missionId] as const,
  missionParticipant: (missionId: string) => ["mission-participant", missionId] as const,
  missionPassword: (missionId: string) => ["mission-password", missionId] as const,
  verifyMissionPassword: (missionId: string) => ["verify-mission-password", missionId] as const,
} as const;

export type MissionQueryKeys = typeof missionQueryKeys;
