import gsap from "gsap";
import { ANIMATION_DURATIONS } from "./constants";
import type { AnimationRefs } from "./useAnimationRefs";

let isAnimating = false;

export function animateFinalElements(refs: AnimationRefs) {
  if (isAnimating) return;
  isAnimating = true;

  const waitForElements = () => {
    return new Promise<void>(resolve => {
      const checkElements = () => {
        if (refs.afterTitle.current && refs.shareButtons.current && refs.button.current) {
          resolve();
        } else {
          requestAnimationFrame(checkElements);
        }
      };
      checkElements();
    });
  };

  waitForElements().then(() => {
    gsap.set(refs.button.current, { opacity: 0, y: 10 });

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
  });
}
