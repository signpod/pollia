import gsap from "gsap";
import { ANIMATION_DELAYS, ANIMATION_DURATIONS } from "./constants";
import type { AnimationRefs } from "./useAnimationRefs";

export function createContentAnimationTimeline(refs: AnimationRefs) {
  const tl = gsap.timeline({ delay: ANIMATION_DELAYS.CONTENT_ITEMS });

  tl.fromTo(
    refs.logo.current,
    { opacity: 0, y: -10 },
    { opacity: 1, y: 0, duration: ANIMATION_DURATIONS.CONTENT_FADE },
  );

  tl.fromTo(
    refs.title.current,
    { opacity: 0, y: -10 },
    { opacity: 1, y: 0, duration: ANIMATION_DURATIONS.CONTENT_FADE },
    "-=0.1",
  );

  tl.fromTo(
    refs.infoBox.current,
    { opacity: 0, y: -10 },
    { opacity: 1, y: 0, duration: ANIMATION_DURATIONS.CONTENT_FADE },
    "-=0.1",
  );

  if (refs.image.current) {
    tl.fromTo(
      refs.image.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: ANIMATION_DURATIONS.CONTENT_FADE },
      "-=0.1",
    );
  }

  return tl;
}
