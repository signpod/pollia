export const rewardQueryKeys = {
  all: () => ["reward"] as const,
  reward: (rewardId: string) => ["reward", rewardId] as const,
} as const;

export type RewardQueryKeys = typeof rewardQueryKeys;
