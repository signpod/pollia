import { generateUniqueId } from "@/lib/utils";
import { atom } from "jotai";

export interface SurveyOption {
  id: string;
  description: string;
  imageUrl?: string;
  order: number;
  fileUploadId?: string;
}

const createEmptySurveyOption = (order: number): SurveyOption => ({
  id: generateUniqueId(),
  description: "",
  imageUrl: undefined,
  order,
  fileUploadId: undefined,
});

export const multipleChoiceTitleAtom = atom<string>("");
export const multipleChoiceTitleTouchedAtom = atom<boolean>(false);
export const multipleChoiceDescriptionAtom = atom<string>("");
export const multipleChoiceImageUrlAtom = atom<string | undefined>(undefined);
export const multipleChoiceImageFileUploadIdAtom = atom<string | undefined>(undefined);

export const multipleChoiceMaxSelectionsAtom = atom<number>(1);

export const multipleChoiceOptionsAtom = atom<SurveyOption[]>([
  createEmptySurveyOption(0),
  createEmptySurveyOption(1),
]);

export const addMultipleChoiceOptionAtom = atom(null, (get, set) => {
  const options = get(multipleChoiceOptionsAtom);
  const newOrder = options.length;
  const newOption = createEmptySurveyOption(newOrder);
  set(multipleChoiceOptionsAtom, [...options, newOption]);
});

export const removeMultipleChoiceOptionAtom = atom(null, (get, set, optionId: string) => {
  const options = get(multipleChoiceOptionsAtom);
  const filteredOptions = options.filter(option => option.id !== optionId);

  const reorderedOptions = filteredOptions.map((option, index) => ({
    ...option,
    order: index,
  }));
  set(multipleChoiceOptionsAtom, reorderedOptions);
});

export const updateMultipleChoiceOptionAtom = atom(
  null,
  (get, set, update: { id: string; data: Partial<Omit<SurveyOption, "id" | "order">> }) => {
    const options = get(multipleChoiceOptionsAtom);
    const updatedOptions = options.map(option =>
      option.id === update.id ? { ...option, ...update.data } : option,
    );
    set(multipleChoiceOptionsAtom, updatedOptions);
  },
);

export const resetMultipleChoiceOptionsAtom = atom(null, (_get, set) => {
  set(multipleChoiceOptionsAtom, [createEmptySurveyOption(0), createEmptySurveyOption(1)]);
});

export const multipleChoiceImageCountAtom = atom(get => {
  const imageUrl = get(multipleChoiceImageUrlAtom);
  return imageUrl ? 1 : 0;
});

export const multipleChoiceDataAtom = atom(get => {
  const options = get(multipleChoiceOptionsAtom);
  const validOptions = options.filter(option => option.description.trim());

  return {
    title: get(multipleChoiceTitleAtom),
    description: get(multipleChoiceDescriptionAtom),
    imageUrl: get(multipleChoiceImageUrlAtom),
    imageFileUploadId: get(multipleChoiceImageFileUploadIdAtom),
    maxSelections: get(multipleChoiceMaxSelectionsAtom),
    options: validOptions,
    totalOptionsCount: options.length,
    validOptionsCount: validOptions.length,
  };
});

export const resetMultipleChoiceAtom = atom(null, (_get, set) => {
  set(multipleChoiceTitleAtom, "");
  set(multipleChoiceTitleTouchedAtom, false);
  set(multipleChoiceDescriptionAtom, "");
  set(multipleChoiceImageUrlAtom, undefined);
  set(multipleChoiceImageFileUploadIdAtom, undefined);
  set(multipleChoiceMaxSelectionsAtom, 1);
  set(multipleChoiceOptionsAtom, [createEmptySurveyOption(0), createEmptySurveyOption(1)]);
});
