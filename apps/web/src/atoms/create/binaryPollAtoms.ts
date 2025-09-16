import { POLL_CATEGORIES } from "@/constants/poll";
import { atom } from "jotai";

// 카테고리 관련 UI 상태
export const binaryPollAvailableCategoriesAtom = atom(POLL_CATEGORIES);
export const binaryPollCategorySelectModalOpenAtom = atom(false);

// Binary Poll 기본 정보
export const binaryPollCategoryAtom = atom<
  (typeof POLL_CATEGORIES)[number] | undefined
>(undefined);
export const binaryPollTitleAtom = atom<string>("");
export const binaryPollDescriptionAtom = atom<string>("");
export const binaryPollThumbnailUrlAtom = atom<string | undefined>(undefined);

// Binary Poll 기간 설정
export const binaryPollIsUnlimitedAtom = atom<boolean>(false);
export const binaryPollStartDateAtom = atom<string>(
  new Date().toLocaleDateString()
);
export const binaryPollStartTimeAtom = atom<string>(
  new Date().toLocaleTimeString()
);
export const binaryPollEndDateAtom = atom<string>(
  new Date().toLocaleDateString()
);
export const binaryPollEndTimeAtom = atom<string>(
  new Date().toLocaleTimeString()
);

// Binary Poll 옵션 설정
export const binaryPollOption1Atom = atom<string>("");
export const binaryPollOption2Atom = atom<string>("");

// 계산된 상태들
export const binaryPollThumbnailCountAtom = atom((get) => {
  const thumbnailUrl = get(binaryPollThumbnailUrlAtom);
  return thumbnailUrl ? 1 : 0;
});

// Binary Poll 검증
export const binaryPollStepValidationAtom = atom((get) => {
  const category = get(binaryPollCategoryAtom);
  const title = get(binaryPollTitleAtom);

  return {
    isValid: !!category && !!title.trim(),
    errors: {
      category: !category ? "카테고리를 선택해주세요" : null,
      title: !title.trim() ? "제목을 입력해주세요" : null,
    },
  };
});

// 전체 Binary Poll 검증 (하위 호환성을 위해 유지)
export const binaryPollValidationAtom = binaryPollStepValidationAtom;

// Binary Poll 전체 데이터 조합
export const binaryPollDataAtom = atom((get) => ({
  category: get(binaryPollCategoryAtom),
  title: get(binaryPollTitleAtom),
  description: get(binaryPollDescriptionAtom),
  thumbnailUrl: get(binaryPollThumbnailUrlAtom),

  // 무기한 설정 여부
  isUnlimited: get(binaryPollIsUnlimitedAtom),
  startDate: get(binaryPollStartDateAtom),
  startTime: get(binaryPollStartTimeAtom),
  endDate: get(binaryPollEndDateAtom),
  endTime: get(binaryPollEndTimeAtom),

  binaryOptions: {
    option1: get(binaryPollOption1Atom),
    option2: get(binaryPollOption2Atom),
  },
}));
