import { atom } from "jotai";

/**
 * 주관식 질문 생성용 Atoms
 * 관리자가 설문 질문을 생성할 때 사용하는 상태 관리
 */

export const subjectiveTitleAtom = atom<string>("");
export const subjectiveTitleTouchedAtom = atom<boolean>(false);
export const subjectiveDescriptionAtom = atom<string>("");
export const subjectiveImageUrlAtom = atom<string | undefined>(undefined);
export const subjectiveImageFileUploadIdAtom = atom<string | undefined>(undefined);

export const subjectiveImageCountAtom = atom(get => {
  const imageUrl = get(subjectiveImageUrlAtom);
  return imageUrl ? 1 : 0;
});

export const subjectiveDataAtom = atom(get => ({
  title: get(subjectiveTitleAtom),
  description: get(subjectiveDescriptionAtom),
  imageUrl: get(subjectiveImageUrlAtom),
  imageFileUploadId: get(subjectiveImageFileUploadIdAtom),
}));

export const resetSubjectiveAtom = atom(null, (_get, set) => {
  set(subjectiveTitleAtom, "");
  set(subjectiveTitleTouchedAtom, false);
  set(subjectiveDescriptionAtom, "");
  set(subjectiveImageUrlAtom, undefined);
  set(subjectiveImageFileUploadIdAtom, undefined);
});
