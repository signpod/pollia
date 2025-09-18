export type BinaryPollType = "ox" | "hobullho";
export type MultiplePollType = "multiple";

export type PollType = BinaryPollType | MultiplePollType;

export type PollCategory =
  | "IT·디지털"
  | "반려동물"
  | "여행·장소"
  | "게임·취미"
  | "스포츠·건강"
  | "엔터테인먼트"
  | "패션·뷰티"
  | "일상·생활"
  | "교육·문화"
  | "음식·맛집"
  | "라이프·육아";

export type PollCandidate = {
  id: string;
  name: string;
  imageUrl?: string;
  link?: string;
};
