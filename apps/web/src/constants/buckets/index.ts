export const STORAGE_BUCKETS = {
  MISSION_IMAGES: "mission-images",
  ACTION_IMAGES: "action-images",
  ACTION_OPTION_IMAGES: "action-option-images",
  ACTION_ANSWER_IMAGES: "action-answer-images",
  ACTION_ANSWER_PDFS: "action-answer-pdfs",
  ACTION_ANSWER_VIDEOS: "action-answer-videos",
  REWARD_IMAGES: "reward-images",
  USER_PROFILE_IMAGES: "user-profile-images",
  FALLBACK: "pollia-images",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];
