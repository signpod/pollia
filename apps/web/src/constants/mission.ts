import { MissionCategory, MissionType } from "@prisma/client";

export const VISIBILITY_CONFIG = {
  public: {
    label: "전체 공개",
    description: "폴리아 메인 피드에 공개가 되어요.",
    badgeClassName: "bg-green-100 text-green-700",
  },
  linkOnly: {
    label: "링크만 공개",
    description: "주소로만 들어올 수 있어요.",
    badgeClassName: "bg-blue-100 text-blue-700",
  },
  private: {
    label: "나만 보기",
    description: "작성자 본인만 들어올 수 있어요.",
    badgeClassName: "bg-zinc-100 text-zinc-500",
  },
} as const;

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
