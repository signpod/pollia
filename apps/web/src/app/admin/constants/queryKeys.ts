export const adminMissionQueryKeys = {
  all: () => ["admin", "mission"] as const,
  mission: (missionId: string) => ["admin", "mission", missionId] as const,
  missions: () => ["admin", "missions"] as const,
} as const;

export type AdminMissionQueryKeys = typeof adminMissionQueryKeys;
