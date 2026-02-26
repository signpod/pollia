import { MissionCategory, MissionType } from "@prisma/client";

export const MISSION_TYPE_LABELS: Record<MissionType, string> = {
  [MissionType.GENERAL]: "표시 미션",
  [MissionType.EXPERIENCE_GROUP]: "비표시 미션",
};

export const MISSION_CATEGORY_LABELS: Record<MissionCategory, string> = {
  [MissionCategory.TEST]: "심리/유형 테스트",
  [MissionCategory.EVENT]: "이벤트",
  [MissionCategory.RESEARCH]: "설문조사/리서치",
  [MissionCategory.CHALLENGE]: "챌린지",
  [MissionCategory.QUIZ]: "퀴즈/게임",
};
