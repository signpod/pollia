import { MissionCategory, MissionType } from "@prisma/client";

export const MISSION_TYPE_LABELS: Record<MissionType, string> = {
  [MissionType.GENERAL]: "일반 미션",
  [MissionType.EXPERIENCE_GROUP]: "체험단 미션",
};

export const MISSION_CATEGORY_LABELS: Record<MissionCategory, string> = {
  [MissionCategory.PROMOTION]: "프로모션",
  [MissionCategory.EVENT]: "행사",
  [MissionCategory.RESEARCH]: "리서치",
  [MissionCategory.CHALLENGE]: "챌린지",
  [MissionCategory.QUIZ]: "게임/퀴즈",
};
