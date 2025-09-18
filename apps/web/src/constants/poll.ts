import { PollType, PollCategory } from "@/types/client/poll";
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
  "IT·디지털",
  "반려동물",
  "여행·장소",
  "게임·취미",
  "스포츠·건강",
  "엔터테인먼트",
  "패션·뷰티",
  "일상·생활",
  "교육·문화",
  "음식·맛집",
  "라이프·육아",
];

const POLL_TYPES: PollType[] = ["ox", "hobullho", "multiple"];

const CATEGORY_ICONS: Record<PollCategory, React.ElementType> = {
  "IT·디지털": MonitorSmartphone,
  반려동물: Dog,
  "여행·장소": MapPin,
  "게임·취미": Music4,
  "스포츠·건강": Dribbble,
  엔터테인먼트: Star,
  "패션·뷰티": Shirt,
  "일상·생활": Sofa,
  "교육·문화": BookOpen,
  "음식·맛집": Coffee,
  "라이프·육아": Baby,
};

export { POLL_CATEGORIES, POLL_TYPES, CATEGORY_ICONS };
