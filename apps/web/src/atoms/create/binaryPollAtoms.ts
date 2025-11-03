import { POLL_CATEGORIES } from "@/constants/poll";
import { getCurrentDate, getCurrentTime } from "@/lib/date";
import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";

export const binaryPollAvailableCategoriesAtom = atom(POLL_CATEGORIES);
export const binaryPollCategorySelectModalOpenAtom = atom(false);

export const binaryPollCategoryAtom = atom<(typeof POLL_CATEGORIES)[number] | undefined>(undefined);
export const binaryPollTitleAtom = atom<string>("");
export const binaryPollTitleTouchedAtom = atom<boolean>(false);
export const binaryPollDescriptionAtom = atom<string>("");
export const binaryPollThumbnailUrlAtom = atom<string | undefined>(undefined);
export const binaryPollThumbnailFileUploadIdAtom = atom<string | undefined>(undefined);

export const binaryPollIsUnlimitedAtom = atom<boolean>(true);

export const binaryPollStartDateAtom = atomWithDefault(() => getCurrentDate());
export const binaryPollStartTimeAtom = atomWithDefault(() => getCurrentTime({ roundMinutesTo: 5 }));
export const binaryPollEndDateAtom = atom<string>("");
export const binaryPollEndTimeAtom = atom<string>("");

export const binaryPollThumbnailCountAtom = atom(get => {
  const thumbnailUrl = get(binaryPollThumbnailUrlAtom);
  return thumbnailUrl ? 1 : 0;
});

export const binaryPollStepValidationAtom = atom(get => {
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

export const binaryPollDataAtom = atom(get => ({
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
  set(binaryPollTitleTouchedAtom, false);
  set(binaryPollDescriptionAtom, "");
  set(binaryPollThumbnailUrlAtom, undefined);
  set(binaryPollThumbnailFileUploadIdAtom, undefined);
  set(binaryPollIsUnlimitedAtom, false);
  set(binaryPollStartDateAtom, "");
  set(binaryPollStartTimeAtom, "");
  set(binaryPollEndDateAtom, "");
  set(binaryPollEndTimeAtom, "");
});
