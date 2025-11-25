import gsap from "gsap";
import { ANIMATION_DELAYS, ANIMATION_DURATIONS } from "./constants";
import type { AnimationRefs } from "./useAnimationRefs";

interface AnimationCallbacks {
  setShowFirstText: (value: boolean) => void;
  setStartAfter: (value: boolean) => void;
  setShowContent: (value: boolean) => void;
}

export function createMainAnimationTimeline(
  refs: AnimationRefs,
  callbacks: AnimationCallbacks,
  animateFinalElements: () => void,
) {
  const tl = gsap.timeline();

  tl.fromTo(
    refs.box.current,
    { scale: 0, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: ANIMATION_DURATIONS.BOX_SCALE,
      ease: "back.out(1.7)",
    },
    0,
  );

  tl.fromTo(
    refs.text.current,
    { y: 20, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: ANIMATION_DURATIONS.TEXT_FADE,
      ease: "power2.out",
    },
    "-=0.4",
  );

  tl.to({}, { duration: ANIMATION_DURATIONS.WAIT });

  tl.to(refs.checkIcon.current, {
    opacity: 0,
    scale: 0.8,
    duration: ANIMATION_DURATIONS.CHECK_FADE,
  });

  tl.to(refs.text.current, {
    opacity: 0,
    y: -10,
    duration: ANIMATION_DURATIONS.TEXT_OUT,
  });

  tl.call(() => {
    callbacks.setShowFirstText(false);
    callbacks.setStartAfter(true);
  });

  tl.to(
    refs.box.current,
    {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0px 4px 20px rgba(92, 11, 11, 0.08)",
      duration: ANIMATION_DURATIONS.BOX_TRANSFORM,
      ease: "power2.inOut",
    },
    "-=0.4",
  );

  tl.call(() => {
    callbacks.setShowContent(true);
  });

  tl.add(() => {
    setTimeout(() => {
      animateFinalElements();
    }, ANIMATION_DELAYS.FINAL_ELEMENTS);
  });

  return tl;
}
