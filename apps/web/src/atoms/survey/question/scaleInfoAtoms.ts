import { atom } from "jotai";

const DEFAULT_SCALE_VALUE = 3;

export const scaleTitleAtom = atom<string>("");
export const scaleTitleTouchedAtom = atom<boolean>(false);
export const scaleDescriptionAtom = atom<string>("");
export const scaleImageUrlAtom = atom<string | undefined>(undefined);
export const scaleImageFileUploadIdAtom = atom<string | undefined>(undefined);

export const scaleValueAtom = atom<number>(DEFAULT_SCALE_VALUE);

export const scaleImageCountAtom = atom(get => {
  const imageUrl = get(scaleImageUrlAtom);
  return imageUrl ? 1 : 0;
});

export const scaleDataAtom = atom(get => ({
  title: get(scaleTitleAtom),
  description: get(scaleDescriptionAtom),
  imageUrl: get(scaleImageUrlAtom),
  imageFileUploadId: get(scaleImageFileUploadIdAtom),
  value: get(scaleValueAtom),
}));

export const resetScaleAtom = atom(null, (_get, set) => {
  set(scaleTitleAtom, "");
  set(scaleTitleTouchedAtom, false);
  set(scaleDescriptionAtom, "");
  set(scaleImageUrlAtom, undefined);
  set(scaleImageFileUploadIdAtom, undefined);
  set(scaleValueAtom, DEFAULT_SCALE_VALUE);
});
