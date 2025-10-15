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
export const binaryPollThumbnailFileUploadIdAtom = atom<string | undefined>(
  undefined
);

export const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split("T")[0]!;
};

export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.floor(minutes / 5) * 5;

  return `${String(hours).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;
};

export const binaryPollIsUnlimitedAtom = atom<boolean>(true);

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
  thumbnailFileUploadId: get(binaryPollThumbnailFileUploadIdAtom),

  isUnlimited: get(binaryPollIsUnlimitedAtom),
  startDate: get(binaryPollStartDateAtom),
  startTime: get(binaryPollStartTimeAtom),
  endDate: get(binaryPollEndDateAtom),
  endTime: get(binaryPollEndTimeAtom),
}));


export const resetBinaryPollAtom = atom(null, (_get, set) => {
  set(binaryPollCategoryAtom, undefined);
  set(binaryPollTitleAtom, "");
  set(binaryPollDescriptionAtom, "");
  set(binaryPollThumbnailUrlAtom, undefined);
  set(binaryPollThumbnailFileUploadIdAtom, undefined);
  set(binaryPollIsUnlimitedAtom, false);
  set(binaryPollStartDateAtom, "");
  set(binaryPollStartTimeAtom, "");
  set(binaryPollEndDateAtom, "");
  set(binaryPollEndTimeAtom, "");
});