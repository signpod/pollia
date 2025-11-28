import gsap from "gsap";
import { ANIMATION_DURATIONS } from "./constants";
import type { AnimationRefs } from "./useAnimationRefs";

export function animateFinalElements(refs: AnimationRefs) {
  const subTl = gsap.timeline();

  subTl.to(refs.afterTitle.current, {
    opacity: 1,
    y: 0,
    duration: ANIMATION_DURATIONS.CONTENT_FADE,
    ease: "power2.out",
  });

  subTl.to(refs.shareButtons.current, {
    opacity: 1,
    y: 0,
    duration: ANIMATION_DURATIONS.CONTENT_FADE,
    ease: "power2.out",
  });

  subTl.to(
    refs.button.current,
    {
      opacity: 1,
      y: 0,
      duration: ANIMATION_DURATIONS.CONTENT_FADE,
      ease: "power2.out",
    },
    "-=0.1",
  );
}
