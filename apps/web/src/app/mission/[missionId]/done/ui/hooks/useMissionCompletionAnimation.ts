import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

interface AnimationState {
  isReversed: boolean;
  showTitle: boolean;
  showDescription: boolean;
  showStarTooltip: boolean;
}

export function useMissionCompletionAnimation() {
  const starBoxRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const shareBoxRef = useRef<HTMLDivElement>(null);

  const [animationState, setAnimationState] = useState<AnimationState>({
    isReversed: false,
    showTitle: false,
    showDescription: false,
    showStarTooltip: false,
  });

  useEffect(() => {
    if (!starBoxRef.current) return;

    const timeline = gsap.timeline();

    timeline.delay(0.5);
    timeline.to(starBoxRef.current, {
      scale: 0.5,
      duration: 0.3,
      marginBottom: "-120px",
      ease: "power2.inOut",
    });
    timeline.to(
      gradientRef.current,
      {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      },
      "-=0.2",
    );
    timeline.call(
      () => {
        setAnimationState({
          isReversed: true,
          showTitle: true,
          showDescription: true,
          showStarTooltip: true,
        });
      },
      [],
      "-=0.1",
    );
    timeline.to(
      shareBoxRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 0.2,
        ease: "easeOut",
      },
      "+=1",
    );
  }, []);

  return {
    refs: { starBoxRef, gradientRef, shareBoxRef },
    ...animationState,
  };
}
