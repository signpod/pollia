import { atom } from "jotai";

export const subjectiveTitleAtom = atom<string>("");
export const subjectiveDescriptionAtom = atom<string>("");
export const subjectiveImageUrlAtom = atom<string | undefined>(undefined);
export const subjectiveImageFileUploadIdAtom = atom<string | undefined>(
  undefined
);

export const subjectiveImageCountAtom = atom((get) => {
  const imageUrl = get(subjectiveImageUrlAtom);
  return imageUrl ? 1 : 0;
});

export const subjectiveDataAtom = atom((get) => ({
  title: get(subjectiveTitleAtom),
  description: get(subjectiveDescriptionAtom),
  imageUrl: get(subjectiveImageUrlAtom),
  imageFileUploadId: get(subjectiveImageFileUploadIdAtom),
}));

export const resetSubjectiveAtom = atom(null, (_get, set) => {
  set(subjectiveTitleAtom, "");
  set(subjectiveDescriptionAtom, "");
  set(subjectiveImageUrlAtom, undefined);
  set(subjectiveImageFileUploadIdAtom, undefined);
});
