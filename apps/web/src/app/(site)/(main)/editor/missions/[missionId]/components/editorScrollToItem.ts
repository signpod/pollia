const SCROLL_DELAY_FRAMES = 2;

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
