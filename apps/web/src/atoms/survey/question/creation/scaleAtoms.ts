import { atom } from "jotai";

/**
 * 척도형 질문 생성용 Atoms
 * 관리자가 설문 질문을 생성할 때 사용하는 상태 관리
 */

export const scaleTitleAtom = atom<string>("");
export const scaleTitleTouchedAtom = atom<boolean>(false);
export const scaleDescriptionAtom = atom<string>("");
export const scaleImageUrlAtom = atom<string | undefined>(undefined);
export const scaleImageFileUploadIdAtom = atom<string | undefined>(undefined);

export const scaleImageCountAtom = atom(get => {
  const imageUrl = get(scaleImageUrlAtom);
  return imageUrl ? 1 : 0;
});

export const scaleDataAtom = atom(get => ({
  title: get(scaleTitleAtom),
  description: get(scaleDescriptionAtom),
  imageUrl: get(scaleImageUrlAtom),
  imageFileUploadId: get(scaleImageFileUploadIdAtom),
}));

export const resetScaleAtom = atom(null, (_get, set) => {
  set(scaleTitleAtom, "");
  set(scaleTitleTouchedAtom, false);
  set(scaleDescriptionAtom, "");
  set(scaleImageUrlAtom, undefined);
  set(scaleImageFileUploadIdAtom, undefined);
});
