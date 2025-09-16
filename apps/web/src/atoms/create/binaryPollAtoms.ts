import { POLL_CATEGORIES } from "@/constants/poll";
import { atom } from "jotai";

export const binaryPollAvailableCategoriesAtom = atom(POLL_CATEGORIES);
export const binaryPollCategorySelectModalOpenAtom = atom(false);

export const binaryPollCategoryAtom = atom<
  (typeof POLL_CATEGORIES)[number] | undefined
>(undefined);
export const binaryPollTitleAtom = atom<string>("");
export const binaryPollDescriptionAtom = atom<string>("");
export const binaryPollThumbnailUrlAtom = atom<string | undefined>(undefined);

export const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split("T")[0]!;
};

export const getCurrentTime = (): string => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

export const binaryPollIsUnlimitedAtom = atom<boolean>(false);

export const binaryPollStartDateAtom = atom<string>("");
export const binaryPollStartTimeAtom = atom<string>("");
export const binaryPollEndDateAtom = atom<string>("");
export const binaryPollEndTimeAtom = atom<string>("");

export const initializeDateTimeAtom = atom(null, (_get, set) => {
  const currentDate = getCurrentDate();
  const currentTime = getCurrentTime();

  set(binaryPollStartDateAtom, currentDate);
  set(binaryPollStartTimeAtom, currentTime);
  set(binaryPollEndDateAtom, currentDate);
  set(binaryPollEndTimeAtom, currentTime);
});

export const resetToCurrentDateTimeAtom = atom(null, (_get, set) => {
  const currentDate = getCurrentDate();
  const currentTime = getCurrentTime();

  set(binaryPollStartDateAtom, currentDate);
  set(binaryPollStartTimeAtom, currentTime);
  set(binaryPollEndDateAtom, currentDate);
  set(binaryPollEndTimeAtom, currentTime);
});

export const binaryPollOption1Atom = atom<string>("");
export const binaryPollOption2Atom = atom<string>("");

export const binaryPollThumbnailCountAtom = atom((get) => {
  const thumbnailUrl = get(binaryPollThumbnailUrlAtom);
  return thumbnailUrl ? 1 : 0;
});

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

export const binaryPollValidationAtom = binaryPollStepValidationAtom;

export const binaryPollDataAtom = atom((get) => ({
  category: get(binaryPollCategoryAtom),
  title: get(binaryPollTitleAtom),
  description: get(binaryPollDescriptionAtom),
  thumbnailUrl: get(binaryPollThumbnailUrlAtom),

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
