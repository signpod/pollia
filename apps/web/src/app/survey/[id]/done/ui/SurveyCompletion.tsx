"use client";

import { ROUTES } from "@/constants/routes";
import { useReadSurvey } from "@/hooks/survey";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { animateFinalElements } from "./animations/animateFinalElements";
import { createContentAnimationTimeline } from "./animations/createContentAnimationTimeline";
import { createMainAnimationTimeline } from "./animations/createMainAnimationTimeline";
import { useAnimationRefs } from "./animations/useAnimationRefs";
import { AnimatedBox } from "./components/AnimatedBox";
import { CompletionText } from "./components/CompletionText";
import { MainButton } from "./components/MainButton";
import { ShareButtons } from "./components/ShareButtons";
import { ShareTitle } from "./components/ShareTitle";
import { SurveyCardContent } from "./components/SurveyCardContent";

export function SurveyCompletion() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: survey } = useReadSurvey(params.id);
  const { title, estimatedMinutes, deadline, imageUrl, target } = survey?.data ?? {};

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

  useEffect(() => {
    if (!showContent) return;
    if (!refs.logo.current || !refs.title.current || !refs.infoBox.current) return;

    const timeline = createContentAnimationTimeline(refs);

    return () => {
      timeline.kill();
    };
  }, [showContent, refs]);

  useEffect(() => {
    const currentUrl = window.location.pathname + window.location.search;
    window.history.replaceState({ ...window.history.state, fromSurveyQuestion: true }, "");
    window.history.pushState({ ...window.history.state, preventBack: true }, "", currentUrl);

    const handlePopState = (event: PopStateEvent) => {
      window.history.pushState({ ...window.history.state, preventBack: true }, "", currentUrl);
      router.push(ROUTES.SURVEY(params.id));
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [params.id, router]);

  return (
    <div
      className={cn(
        "relative w-full flex flex-col items-center gap-6 pt-[280px] flex-1 overflow-hidden bg-white",
        startAfter ? "my-auto pt-0" : "pt-[280px]",
      )}
    >
      <motion.div
        layout
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative flex flex-col items-center gap-6 bg-white/80 p-6 w-full"
      >
        {/* 공유 제목 */}
        {showContent && !showFirstText && <ShareTitle ref={refs.afterTitle} />}

        {/* 메인 박스 */}
        <AnimatedBox ref={refs.box} showContent={showContent} checkIconRef={refs.checkIcon}>
          {showContent && (
            <SurveyCardContent
              refs={refs}
              title={title}
              estimatedMinutes={estimatedMinutes}
              deadline={deadline}
              target={target}
              imageUrl={imageUrl}
            />
          )}
        </AnimatedBox>

        {/* 첫 번째 텍스트 */}
        {showFirstText && <CompletionText ref={refs.text} title={title} />}

        {/* 공유 버튼들 */}
        {showContent && <ShareButtons ref={refs.shareButtons} />}
      </motion.div>

      {/* 하단 버튼 */}
      {showContent && (
        <MainButton ref={refs.button} onClick={() => router.push(ROUTES.SURVEY(params.id))} />
      )}
    </div>
  );
}
