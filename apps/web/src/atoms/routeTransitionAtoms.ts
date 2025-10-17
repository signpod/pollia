'use client';

import { atom } from 'jotai';

export const afterTransitionAtom = atom<{ callback: (() => void) | null }>({ callback: null });

export const setAfterTransitionAtom = atom(
  null,
  (_get, set, cb?: () => void) => {
    set(afterTransitionAtom, { callback: cb ?? null });
  }
);

export const runAfterTransitionAtom = atom(
  (get) => get(afterTransitionAtom),
  (get, set) => {
    const { callback: cb } = get(afterTransitionAtom);
    if (cb) {
      cb();
    }
    set(afterTransitionAtom, { callback: null });
  }
);
