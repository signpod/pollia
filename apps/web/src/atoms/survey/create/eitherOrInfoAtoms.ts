import { atom } from "jotai";

export const eitherOrTitleAtom = atom<string>("");
export const eitherOrTitleTouchedAtom = atom<boolean>(false);
export const eitherOrDescriptionAtom = atom<string>("");
export const eitherOrImageUrlAtom = atom<string | undefined>(undefined);
export const eitherOrImageFileUploadIdAtom = atom<string | undefined>(undefined);

export const eitherOrImageCountAtom = atom(get => {
  const imageUrl = get(eitherOrImageUrlAtom);
  return imageUrl ? 1 : 0;
});

export const eitherOrDataAtom = atom(get => ({
  title: get(eitherOrTitleAtom),
  description: get(eitherOrDescriptionAtom),
  imageUrl: get(eitherOrImageUrlAtom),
  imageFileUploadId: get(eitherOrImageFileUploadIdAtom),
}));

export const resetEitherOrAtom = atom(null, (_get, set) => {
  set(eitherOrTitleAtom, "");
  set(eitherOrTitleTouchedAtom, false);
  set(eitherOrDescriptionAtom, "");
  set(eitherOrImageUrlAtom, undefined);
  set(eitherOrImageFileUploadIdAtom, undefined);
});
