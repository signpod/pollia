export const missionQueryKeys = {
  mission: (missionId: string) => ["mission", missionId] as const,
  missionResults: (missionId: string) => ["mission-results", missionId] as const,
  userAnswerStatus: (missionId: string) => ["user-answer-status", missionId] as const,
  userMissions: (userId?: string) =>
    userId ? (["user-missions", userId] as const) : (["user-missions"] as const),
  allMissions: () => ["all-missions"] as const,
  all: () => ["mission"] as const,
  missionResponseForMission: (missionId: string) =>
    ["mission-response-for-mission", missionId] as const,
  missionResponseById: (responseId: string) => ["mission-response-by-id", responseId] as const,
  missionParticipant: (missionId: string) => ["mission-participant", missionId] as const,
  missionPassword: (missionId: string) => ["mission-password", missionId] as const,
  verifyMissionPassword: (missionId: string, password: string) =>
    ["verify-mission-password", missionId, password] as const,
  missionNotionPage: (missionId: string) => ["mission-notion-page", missionId] as const,
  missionStats: (missionId: string, dateRange?: { from: string; to: string }) =>
    dateRange
      ? (["mission-stats", missionId, dateRange.from, dateRange.to] as const)
      : (["mission-stats", missionId] as const),
  missionResponsesPage: (missionId: string, page: number, pageSize: number) =>
    ["mission-responses-page", missionId, page, pageSize] as const,
  myResponses: () => ["my-responses"] as const,
} as const;

export type MissionQueryKeys = typeof missionQueryKeys;
