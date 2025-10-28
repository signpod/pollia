import { atom } from "jotai";

export const scaleTitleAtom = atom<string>("");
export const scaleDescriptionAtom = atom<string>("");
export const scaleImageUrlAtom = atom<string | undefined>(undefined);
export const scaleImageFileUploadIdAtom = atom<string | undefined>(undefined);

export const scaleImageCountAtom = atom((get) => {
  const imageUrl = get(scaleImageUrlAtom);
  return imageUrl ? 1 : 0;
});

export const scaleDataAtom = atom((get) => ({
  title: get(scaleTitleAtom),
  description: get(scaleDescriptionAtom),
  imageUrl: get(scaleImageUrlAtom),
  imageFileUploadId: get(scaleImageFileUploadIdAtom),
}));

export const resetScaleAtom = atom(null, (_get, set) => {
  set(scaleTitleAtom, "");
  set(scaleDescriptionAtom, "");
  set(scaleImageUrlAtom, undefined);
  set(scaleImageFileUploadIdAtom, undefined);
});
