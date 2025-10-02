import { PollType, PollCategory } from "@prisma/client";
import {
  MapPin,
  Music4,
  Sofa,
  BookOpen,
  Baby,
  MonitorSmartphone,
  Dog,
  Dribbble,
  Star,
  Shirt,
  Coffee,
} from "lucide-react";

const POLL_CATEGORIES: PollCategory[] = [
  PollCategory.IT_DIGITAL,
  PollCategory.PET,
  PollCategory.TRAVEL_PLACE,
  PollCategory.GAME_HOBBY,
  PollCategory.SPORTS_HEALTH,
  PollCategory.ENTERTAINMENT,
  PollCategory.FASHION_BEAUTY,
  PollCategory.DAILY_LIFE,
  PollCategory.EDUCATION_CULTURE,
  PollCategory.FOOD_RESTAURANT,
  PollCategory.LIFE_PARENTING,
];

const POLL_TYPES: PollType[] = [
  PollType.YES_NO,
  PollType.LIKE_DISLIKE,
  PollType.MULTIPLE_CHOICE,
] as const;

const CATEGORY_LABELS: Record<PollCategory, string> = {
  [PollCategory.IT_DIGITAL]: "IT·디지털",
  [PollCategory.PET]: "반려동물",
  [PollCategory.TRAVEL_PLACE]: "여행·장소",
  [PollCategory.GAME_HOBBY]: "게임·취미",
  [PollCategory.SPORTS_HEALTH]: "스포츠·건강",
  [PollCategory.ENTERTAINMENT]: "엔터테인먼트",
  [PollCategory.FASHION_BEAUTY]: "패션·뷰티",
  [PollCategory.DAILY_LIFE]: "일상·생활",
  [PollCategory.EDUCATION_CULTURE]: "교육·문화",
  [PollCategory.FOOD_RESTAURANT]: "음식·맛집",
  [PollCategory.LIFE_PARENTING]: "라이프·육아",
};

const TYPE_LABELS: Record<PollType, string> = {
  [PollType.YES_NO]: "O, X",
  [PollType.LIKE_DISLIKE]: "좋아요, 싫어요",
  [PollType.MULTIPLE_CHOICE]: "여러 선택지",
};

const BINARY_POLL_OPTIONS = {
  [PollType.YES_NO]: [
    { description: "맞아요", order: 1 },
    { description: "아니에요", order: 2 },
  ],
  [PollType.LIKE_DISLIKE]: [
    { description: "좋아요", order: 1 },
    { description: "별로예요", order: 2 },
  ],
} as const;

function isBinaryPollType(type: PollType): boolean {
  return type === PollType.YES_NO || type === PollType.LIKE_DISLIKE;
}

const BINARY_OPTION_ORDER = {
  POSITIVE: 1,
  NEGATIVE: 2,
} as const;

const FALLBACK_OPTION_TEXT = {
  [BINARY_OPTION_ORDER.POSITIVE]: "긍정",
  [BINARY_OPTION_ORDER.NEGATIVE]: "부정",
} as const;

const CATEGORY_ICONS: Record<PollCategory, React.ElementType> = {
  [PollCategory.IT_DIGITAL]: MonitorSmartphone,
  [PollCategory.PET]: Dog,
  [PollCategory.TRAVEL_PLACE]: MapPin,
  [PollCategory.GAME_HOBBY]: Music4,
  [PollCategory.SPORTS_HEALTH]: Dribbble,
  [PollCategory.ENTERTAINMENT]: Star,
  [PollCategory.FASHION_BEAUTY]: Shirt,
  [PollCategory.DAILY_LIFE]: Sofa,
  [PollCategory.EDUCATION_CULTURE]: BookOpen,
  [PollCategory.FOOD_RESTAURANT]: Coffee,
  [PollCategory.LIFE_PARENTING]: Baby,
};

export {
  POLL_CATEGORIES,
  POLL_TYPES,
  CATEGORY_LABELS,
  TYPE_LABELS,
  CATEGORY_ICONS,
  BINARY_POLL_OPTIONS,
  BINARY_OPTION_ORDER,
  FALLBACK_OPTION_TEXT,
  isBinaryPollType,
};
