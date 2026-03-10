import type { MobilePreviewMode } from "../atoms/editorMobilePreviewAtom";

export function toggleItemWithPreview<T extends { key: string; kind: string }>(
  itemKey: string,
  items: readonly T[],
  setOpenItemKey: (updater: (prev: string | null) => string | null) => void,
  setMobilePreviewMode: (mode: MobilePreviewMode) => void,
  getExistingPreviewMode: (item: Extract<T, { kind: "existing" }>) => MobilePreviewMode,
  currentOpenItemKey: string | null,
) {
  const next = currentOpenItemKey === itemKey ? null : itemKey;

  if (next) {
    const item = items.find(i => i.key === next);
    if (item?.kind === "existing") {
      setMobilePreviewMode(getExistingPreviewMode(item as Extract<T, { kind: "existing" }>));
    } else {
      setMobilePreviewMode({ type: "intro" });
    }
  } else {
    setMobilePreviewMode({ type: "intro" });
  }

  setOpenItemKey(() => next);
}
