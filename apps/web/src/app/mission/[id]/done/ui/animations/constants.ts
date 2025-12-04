export const ANIMATION_DURATIONS = {
  BOX_SCALE: 0.4,
  TEXT_FADE: 0.4,
  WAIT: 0.8,
  CHECK_FADE: 0.4,
  TEXT_OUT: 0.2,
  BOX_TRANSFORM: 0.4,
  CONTENT_FADE: 0.3,
} as const;

export const ANIMATION_DELAYS = {
  CONTENT_ITEMS: 0.2,
  FINAL_ELEMENTS: 100, // 밀리초 단위 (setTimeout용)
} as const;
