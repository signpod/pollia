import { POLL_CATEGORIES, POLL_TYPES } from "@/constants/poll";
import { PollOption } from "@/types/domain/poll";
import { generateUniqueId } from "@/lib/utils";
import { atom } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { getCurrentDate, getCurrentTime } from "@/lib/date";

export const multiplePollAvailableCategoriesAtom = atom(POLL_CATEGORIES);
export const multiplePollCategorySelectModalOpenAtom = atom(false);

export const multiplePollCategoryAtom = atom<
  (typeof POLL_CATEGORIES)[number] | undefined
>(undefined);
export const multiplePollTitleAtom = atom<string>("");
export const multiplePollDescriptionAtom = atom<string>("");
export const multiplePollThumbnailUrlAtom = atom<string | undefined>(undefined);
export const multiplePollThumbnailFileUploadIdAtom = atom<string | undefined>(
  undefined
);

export const multiplePollMaxSelectionsAtom = atom<number>(1);

export const multiplePollIsUnlimitedAtom = atom<boolean>(true);

export const multiplePollStartDateAtom = atomWithDefault(() =>
  getCurrentDate()
);
export const multiplePollStartTimeAtom = atomWithDefault(() =>
  getCurrentTime({ roundMinutesTo: 5 })
);
export const multiplePollEndDateAtom = atom<string>("");
export const multiplePollEndTimeAtom = atom<string>("");

export const resetToCurrentDateTimeAtom = atom(null, (_get, set) => {
  const currentDate = getCurrentDate();
  const currentTime = getCurrentTime();

  set(multiplePollStartDateAtom, currentDate);
  set(multiplePollStartTimeAtom, currentTime);
  set(multiplePollEndDateAtom, "");
  set(multiplePollEndTimeAtom, "");
});

const createEmptyPollOption = (order: number): PollOption => ({
  id: generateUniqueId(),
  description: "",
  imageUrl: undefined,
  link: undefined,
  order,
  fileUploadId: undefined,
});

export const multiplePollOptionsAtom = atom<PollOption[]>([
  createEmptyPollOption(0),
  createEmptyPollOption(1),
]);

export const addOptionAtom = atom(null, (get, set) => {
  const options = get(multiplePollOptionsAtom);
  const newOrder = options.length;
  const newOption = createEmptyPollOption(newOrder);
  set(multiplePollOptionsAtom, [...options, newOption]);
});

export const removeOptionAtom = atom(null, (get, set, optionId: string) => {
  const options = get(multiplePollOptionsAtom);
  const filteredOptions = options.filter((option) => option.id !== optionId);

  const reorderedOptions = filteredOptions.map((option, index) => ({
    ...option,
    order: index,
  }));
  set(multiplePollOptionsAtom, reorderedOptions);
});

export const updateOptionAtom = atom(
  null,
  (
    get,
    set,
    update: { id: string; data: Partial<Omit<PollOption, "id" | "order">> }
  ) => {
    const options = get(multiplePollOptionsAtom);
    const updatedOptions = options.map((option) =>
      option.id === update.id ? { ...option, ...update.data } : option
    );
    set(multiplePollOptionsAtom, updatedOptions);
  }
);

export const clearOptionsAtom = atom(null, (_get, set) => {
  set(multiplePollOptionsAtom, []);
});

export const resetOptionsAtom = atom(null, (_get, set) => {
  set(multiplePollOptionsAtom, [
    createEmptyPollOption(0),
    createEmptyPollOption(1),
  ]);
});

export const multiplePollThumbnailCountAtom = atom((get) => {
  const thumbnailUrl = get(multiplePollThumbnailUrlAtom);
  return thumbnailUrl ? 1 : 0;
});

export const multiplePollStepValidationAtom = atom((get) => {
  const category = get(multiplePollCategoryAtom);
  const title = get(multiplePollTitleAtom);
  const options = get(multiplePollOptionsAtom);
  const maxSelections = get(multiplePollMaxSelectionsAtom);

  const validOptions = options.filter((option) => option.description.trim());

  const hasValidOptions = validOptions.length >= 2;
  const isMaxSelectionsValid =
    maxSelections >= 1 && maxSelections <= validOptions.length;

  return {
    isValid:
      !!category && !!title.trim() && hasValidOptions && isMaxSelectionsValid,
    errors: {
      category: !category ? "카테고리를 선택해주세요" : null,
      title: !title.trim() ? "제목을 입력해주세요" : null,
      options: !hasValidOptions ? "최소 2개 이상의 옵션을 입력해주세요" : null,
      maxSelections: !isMaxSelectionsValid
        ? `선택 가능 개수는 1~${validOptions.length} 사이여야 합니다`
        : null,
    },
    validOptionsCount: validOptions.length,
  };
});

export const multiplePollValidationAtom = multiplePollStepValidationAtom;

export const adjustMaxSelectionsAtom = atom(null, (get, set) => {
  const options = get(multiplePollOptionsAtom);
  const currentMaxSelections = get(multiplePollMaxSelectionsAtom);
  const validOptions = options.filter((option) => option.description.trim());

  if (validOptions.length > 0 && currentMaxSelections > validOptions.length) {
    set(multiplePollMaxSelectionsAtom, validOptions.length);
  }

  if (validOptions.length === 0) {
    set(multiplePollMaxSelectionsAtom, 1);
  }
});

export const multiplePollDataAtom = atom((get) => {
  const options = get(multiplePollOptionsAtom);
  const validOptions = options.filter((option) => option.description.trim());

  return {
    type: POLL_TYPES[2],

    category: get(multiplePollCategoryAtom),
    title: get(multiplePollTitleAtom),
    description: get(multiplePollDescriptionAtom),

    thumbnailUrl: get(multiplePollThumbnailUrlAtom),
    thumbnailFileUploadId: get(multiplePollThumbnailFileUploadIdAtom),

    maxSelections: get(multiplePollMaxSelectionsAtom),

    isUnlimited: get(multiplePollIsUnlimitedAtom),
    startDate: get(multiplePollStartDateAtom),
    startTime: get(multiplePollStartTimeAtom),
    endDate: get(multiplePollEndDateAtom),
    endTime: get(multiplePollEndTimeAtom),

    options: validOptions,

    totalOptionsCount: options.length,
    validOptionsCount: validOptions.length,
  };
});

export const resetMultiplePollAtom = atom(null, (_get, set) => {
  set(multiplePollCategoryAtom, undefined);
  set(multiplePollTitleAtom, "");
  set(multiplePollDescriptionAtom, "");
  set(multiplePollThumbnailUrlAtom, undefined);
  set(multiplePollThumbnailFileUploadIdAtom, undefined);
  set(multiplePollMaxSelectionsAtom, 1);
  set(multiplePollIsUnlimitedAtom, false);
  set(multiplePollStartDateAtom, "");
  set(multiplePollStartTimeAtom, "");
  set(multiplePollEndDateAtom, "");
  set(multiplePollEndTimeAtom, "");
  set(multiplePollOptionsAtom, [
    createEmptyPollOption(0),
    createEmptyPollOption(1),
  ]);
});
