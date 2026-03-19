import type { MutableRefObject } from "react";

const SCROLL_DELAY_FRAMES = 2;
const SCROLL_RETRY_MAX_ATTEMPTS = 15;

export function scrollToEditorItem(itemKey: string) {
  let frame = 0;
  const tick = () => {
    frame += 1;
    if (frame < SCROLL_DELAY_FRAMES) {
      requestAnimationFrame(tick);
      return;
    }

    const el = document.querySelector(`[data-editor-item-key="${itemKey}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  requestAnimationFrame(tick);
}

interface FormRefWithValidation {
  validateAndGetValues: (opts: { showErrors: boolean }) => unknown;
}

export function scrollToFirstFieldError<T extends { key: string }>(params: {
  items: readonly T[];
  validationIssueCountByItemKey: Record<string, number>;
  formRefs: MutableRefObject<Record<string, FormRefWithValidation | null>>;
  setOpenItemKey: (key: string) => void;
}) {
  const { items, validationIssueCountByItemKey, formRefs, setOpenItemKey } = params;

  const firstErrorItem = items.find(item => (validationIssueCountByItemKey[item.key] ?? 0) > 0);
  if (!firstErrorItem) return;

  formRefs.current[firstErrorItem.key]?.validateAndGetValues({ showErrors: true });
  setOpenItemKey(firstErrorItem.key);

  let attempts = 0;
  const tryScroll = () => {
    const el = document.querySelector("[data-field-error]");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    attempts++;
    if (attempts < SCROLL_RETRY_MAX_ATTEMPTS) {
      requestAnimationFrame(tryScroll);
    }
  };
  requestAnimationFrame(tryScroll);
}
