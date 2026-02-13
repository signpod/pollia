export const missionLikeQueryKeys = {
  likeStatus: (missionId: string) => ["mission-like-status", missionId] as const,
  likedMissions: () => ["liked-missions"] as const,
} as const;

export type MissionLikeQueryKeys = typeof missionLikeQueryKeys;
