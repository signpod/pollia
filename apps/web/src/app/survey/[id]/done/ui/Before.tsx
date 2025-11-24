"use client";

import { Typo } from "@repo/ui/components";
import gsap from "gsap";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConfettiParticlesBurst } from "./ConfettiParticlesBurst";

export function Before() {
  const checkIconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      checkIconRef.current,
      {
        scale: 0,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
      },
    );

    tl.fromTo(
      textRef.current,
      {
        y: 20,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      },
      "-=0.1",
    );

    tl.call(() => {
      setShowConfetti(true);
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center gap-6 pt-[220px] flex-1 overflow-hidden bg-white">
      {showConfetti && <ConfettiParticlesBurst />}
      <div className="z-20 flex flex-col items-center gap-6 bg-white/80 p-6">
        <div
          ref={checkIconRef}
          className="flex justify-center items-center bg-violet-100 rounded-[20px] size-[80px]"
        >
          <Check className=" text-primary size-10" strokeWidth={3} />
        </div>
        <div ref={textRef}>
          <Typo.MainTitle size="small" className="text-center text-primary">
            가나디 설문조사
          </Typo.MainTitle>
          <Typo.MainTitle size="small" className="text-center">
            응답을 성공적으로 제출했어요
          </Typo.MainTitle>
        </div>
      </div>
    </div>
  );
}
