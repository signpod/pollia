import gsap from "gsap";
import { ANIMATION_DURATIONS } from "./constants";
import type { AnimationRefs } from "./useAnimationRefs";

export function animateFinalElements(refs: AnimationRefs) {
  if (refs.button.current?.dataset.animating === "true") return;
  if (refs.button.current) {
    refs.button.current.dataset.animating = "true";
  }
  gsap.set(refs.button.current, { opacity: 0, y: 10 });

  const subTl = gsap.timeline({
    onComplete: () => {
      if (refs.button.current) {
        refs.button.current.dataset.animating = "false";
      }
    },
  });

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
