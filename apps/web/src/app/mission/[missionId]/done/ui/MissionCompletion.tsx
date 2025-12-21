"use client";
import { useReadMission } from "@/hooks/mission";
import { cn } from "@/lib/utils";
import StarBigIcon from "@public/svgs/star-big.svg";
import StarYellow from "@public/svgs/star-yellow.svg";
import { Typo } from "@repo/ui/components";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { animateFinalElements } from "./animations/animateFinalElements";
import { createMainAnimationTimeline } from "./animations/createMainAnimationTimeline";
import { useAnimationRefs } from "./animations/useAnimationRefs";

export function MissionCompletion() {
  const { missionId } = useParams<{ missionId: string }>();
  const router = useRouter();
  const { data: survey } = useReadMission(missionId);
  const { title, estimatedMinutes, deadline, imageUrl, target, brandLogoUrl } = survey?.data ?? {};

  const refs = useAnimationRefs();
  const [showContent, setShowContent] = useState(false);
  const [showFirstText, setShowFirstText] = useState(true);
  const [startAfter, setStartAfter] = useState(false);

  const handleAnimateFinalElements = useCallback(() => {
    animateFinalElements(refs);
  }, [refs]);

  useEffect(() => {
    if (!refs.box.current) return;

    const timeline = createMainAnimationTimeline(
      refs,
      {
        setShowFirstText,
        setStartAfter,
        setShowContent,
      },
      handleAnimateFinalElements,
    );

    return () => {
      timeline.kill();
    };
  }, [refs, handleAnimateFinalElements]);

  return (
    <div
      className={cn(
        "relative w-full flex flex-col items-center gap-6 pt-[25%] flex-1 overflow-hidden",
        "bg-linear-to-b from-[#FFE672]/0 via-[#FFE672]/10 to-[#FFE672]/0",
        startAfter ? "my-auto pt-0" : "pt-[25%]",
      )}
    >
      <Typo.MainTitle size="large" className="text-center">
        모든 미션 완료!
      </Typo.MainTitle>

      <div className="relative pt-[100px] px-[70px]">
        {[...Array(5)].map((_, i) => {
          const angle = -90 + (i - 2) * 30;
          const radian = (angle * Math.PI) / 180;
          const radius = 120;
          const x = Math.cos(radian) * radius;
          const y = Math.sin(radian) * radius;
          return (
            <div
              key={`star-${i}`}
              className={cn("absolute left-1/2 top-1/2")}
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <StarYellow className={i % 2 === 0 ? "size-10" : "size-8"} />
            </div>
          );
        })}
        <StarBigIcon className="translate-y-[-40px]" />
      </div>
    </div>
  );
}
