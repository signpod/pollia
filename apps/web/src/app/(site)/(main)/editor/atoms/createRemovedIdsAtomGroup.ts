import { type PrimitiveAtom, atom } from "jotai";

export function createRemovedIdsAtomGroup(
  formVersionByIdAtom: PrimitiveAtom<Record<string, number>>,
) {
  const removedIdsAtom = atom<Set<string>>(new Set<string>());

  const markRemovedAtom = atom(null, (get, set, id: string) => {
    const prev = get(removedIdsAtom);
    const next = new Set(prev);
    next.add(id);
    set(removedIdsAtom, next);
  });

  const resetAfterSaveAtom = atom(null, (get, set, successfulRemovedIds: Set<string>) => {
    if (successfulRemovedIds.size === 0) return;

    set(formVersionByIdAtom, prev => {
      const next = { ...prev };
      for (const id of successfulRemovedIds) {
        delete next[id];
      }
      return next;
    });

    const current = get(removedIdsAtom);
    const next = new Set<string>(current);
    for (const id of successfulRemovedIds) {
      next.delete(id);
    }
    set(removedIdsAtom, next);
  });

  return { removedIdsAtom, markRemovedAtom, resetAfterSaveAtom };
}
