"use client";

import { ROUTES } from "@/constants/routes";
import { useReadSurvey } from "@/hooks/survey";
import { cn } from "@/lib/utils";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import PolliaLogo from "@public/images/pollia-logo.png";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { ButtonV2, FixedBottomLayout, Typo } from "@repo/ui/components";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Check, Share2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const ANIMATION_DURATIONS = {
  BOX_SCALE: 0.4,
  TEXT_FADE: 0.4,
  WAIT: 0.8,
  CHECK_FADE: 0.4,
  TEXT_OUT: 0.2,
  BOX_TRANSFORM: 0.4,
  CONTENT_FADE: 0.3,
} as const;

const ANIMATION_DELAYS = {
  CONTENT_ITEMS: 0.2,
  FINAL_ELEMENTS: 100,
} as const;

interface AnimationRefs {
  box: React.RefObject<HTMLDivElement | null>;
  checkIcon: React.RefObject<HTMLDivElement | null>;
  surveyContent: React.RefObject<HTMLDivElement | null>;
  logo: React.RefObject<HTMLDivElement | null>;
  title: React.RefObject<HTMLDivElement | null>;
  infoBox: React.RefObject<HTMLDivElement | null>;
  image: React.RefObject<HTMLDivElement | null>;
  text: React.RefObject<HTMLDivElement | null>;
  afterTitle: React.RefObject<HTMLDivElement | null>;
  button: React.RefObject<HTMLButtonElement | null>;
  shareButtons: React.RefObject<HTMLDivElement | null>;
}

function useAnimationRefs(): AnimationRefs {
  return {
    box: useRef<HTMLDivElement>(null),
    checkIcon: useRef<HTMLDivElement>(null),
    surveyContent: useRef<HTMLDivElement>(null),
    logo: useRef<HTMLDivElement>(null),
    title: useRef<HTMLDivElement>(null),
    infoBox: useRef<HTMLDivElement>(null),
    image: useRef<HTMLDivElement>(null),
    text: useRef<HTMLDivElement>(null),
    afterTitle: useRef<HTMLDivElement>(null),
    button: useRef<HTMLButtonElement>(null),
    shareButtons: useRef<HTMLDivElement>(null),
  };
}

export function SurveyCompletion() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: survey } = useReadSurvey(params.id);
  const { title, estimatedMinutes, deadline, imageUrl, target } = survey?.data ?? {};

  const refs = useAnimationRefs();
  const [showContent, setShowContent] = useState(false);
  const [showFirstText, setShowFirstText] = useState(true);
  const [startAfter, setStartAfter] = useState(false);

  useEffect(() => {
    if (!refs.box.current) return;

    const timeline = createMainAnimationTimeline(refs, {
      setShowFirstText,
      setStartAfter,
      setShowContent,
    });

    return () => {
      timeline.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showContent) return;
    if (!refs.logo.current || !refs.title.current || !refs.infoBox.current) return;

    const timeline = createContentAnimationTimeline(refs);

    return () => {
      timeline.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showContent]);

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

function createMainAnimationTimeline(
  refs: AnimationRefs,
  callbacks: {
    setShowFirstText: (value: boolean) => void;
    setStartAfter: (value: boolean) => void;
    setShowContent: (value: boolean) => void;
  },
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

  tl.to(refs.box.current, {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0px 4px 20px rgba(92, 11, 11, 0.08)",
    duration: ANIMATION_DURATIONS.BOX_TRANSFORM,
    ease: "power2.inOut",
  });

  tl.call(() => {
    callbacks.setShowContent(true);
  });

  tl.add(() => {
    setTimeout(() => {
      animateFinalElements(refs);
    }, ANIMATION_DELAYS.FINAL_ELEMENTS);
  });

  return tl;
}

function animateFinalElements(refs: AnimationRefs) {
  if (!refs.afterTitle.current || !refs.shareButtons.current || !refs.button.current) return;

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

  subTl.fromTo(
    refs.button.current,
    { opacity: 0, y: 10 },
    {
      opacity: 1,
      y: 0,
      duration: ANIMATION_DURATIONS.CONTENT_FADE,
      ease: "power2.out",
    },
    "-=0.1",
  );
}

function createContentAnimationTimeline(refs: AnimationRefs) {
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

const ShareTitle = React.forwardRef<HTMLDivElement>((_props, ref) => (
  <div ref={ref} style={{ opacity: 0, transform: "translateY(10px)" }}>
    <Typo.MainTitle size="small" className="text-center">
      방금 참여한 설문을
      <br />
      친구들에게도 공유해보세요👀
    </Typo.MainTitle>
  </div>
));
ShareTitle.displayName = "ShareTitle";

interface AnimatedBoxProps {
  showContent: boolean;
  checkIconRef: React.RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
}

const AnimatedBox = React.forwardRef<HTMLDivElement, AnimatedBoxProps>(
  ({ showContent, checkIconRef, children }, ref) => (
    <motion.div
      layout
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      ref={ref}
      className="relative flex flex-col justify-center items-center bg-violet-100 rounded-[20px] p-4 overflow-visible"
      style={{
        width: showContent ? "100%" : "80px",
        minHeight: showContent ? "auto" : "80px",
      }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <DotLottieReact
          src="/lotties/Pop.lottie"
          loop={false}
          autoplay
          speed={2}
          style={{ width: "600px", height: "600px", zIndex: 0 }}
        />
      </div>

      <div ref={checkIconRef} className="absolute inset-0 flex items-center justify-center z-20">
        <Check className="text-primary size-10" strokeWidth={3} />
      </div>

      {children}
    </motion.div>
  ),
);
AnimatedBox.displayName = "AnimatedBox";

interface SurveyCardContentProps {
  refs: AnimationRefs;
  title?: string | null;
  estimatedMinutes?: number | null;
  deadline?: string | Date | null;
  target?: string | null;
  imageUrl?: string | null;
}

function SurveyCardContent({
  refs,
  title,
  estimatedMinutes,
  deadline,
  target,
  imageUrl,
}: SurveyCardContentProps) {
  return (
    <div ref={refs.surveyContent} className="flex flex-col gap-2 w-full relative z-20">
      {/* 로고 */}
      <div ref={refs.logo} style={{ opacity: 0 }}>
        <Image src={PolliaLogo} alt="Pollia Logo" width={52} height={16} />
      </div>

      {/* 제목 */}
      <div ref={refs.title} style={{ opacity: 0 }}>
        <Typo.MainTitle size="small" className="text-left">
          {title}
        </Typo.MainTitle>
      </div>

      {/* 정보 박스 */}
      <div
        ref={refs.infoBox}
        className="w-full flex flex-col gap-3 bg-light rounded-sm p-3"
        style={{ opacity: 0 }}
      >
        {estimatedMinutes && <InfoRow label="소요시간" value={`${estimatedMinutes}분`} />}
        {deadline && <InfoRow label="마감일" value={formatDeadline(deadline)} />}
        {target && <InfoRow label="대상자" value={target} />}
      </div>

      {/* 이미지 */}
      {imageUrl && (
        <div
          ref={refs.image}
          className="w-full aspect-[3/2] overflow-hidden rounded-sm"
          style={{ opacity: 0 }}
        >
          <Image
            src={imageUrl}
            alt={title || "Survey image"}
            width={400}
            height={200}
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </div>
  );
}

interface CompletionTextProps {
  title?: string;
}

const CompletionText = React.forwardRef<HTMLDivElement, CompletionTextProps>(({ title }, ref) => (
  <div ref={ref}>
    <Typo.MainTitle size="small" className="text-center text-primary">
      {title}
    </Typo.MainTitle>
    <Typo.MainTitle size="small" className="text-center">
      응답을 성공적으로 제출했어요
    </Typo.MainTitle>
  </div>
));
CompletionText.displayName = "CompletionText";

const ShareButtons = React.forwardRef<HTMLDivElement>((_props, ref) => (
  <div
    ref={ref}
    className="flex gap-8 w-full justify-center"
    style={{ opacity: 0, transform: "translateY(10px)" }}
  >
    <button type="button" className="flex flex-col gap-2">
      <div className="bg-[#FEE500] size-12 p-3 rounded-sm">
        <KakaoIcon />
      </div>
      <Typo.Body className="text-sub">카카오톡</Typo.Body>
    </button>

    <button type="button" className="flex flex-col gap-2">
      <div className="bg-white border border-default size-12 p-3 rounded-sm">
        <Share2 />
      </div>
      <Typo.Body className="text-sub">공유하기</Typo.Body>
    </button>
  </div>
));
ShareButtons.displayName = "ShareButtons";

interface MainButtonProps {
  onClick: () => void;
}

const MainButton = React.forwardRef<HTMLButtonElement, MainButtonProps>(({ onClick }, ref) => (
  <FixedBottomLayout.Content className="px-5 py-3">
    <ButtonV2
      ref={ref}
      variant="primary"
      size="large"
      className="w-full opacity-0"
      onClick={onClick}
    >
      <div className="flex justify-center items-center text-center flex-1">메인으로 가기</div>
    </ButtonV2>
  </FixedBottomLayout.Content>
));
MainButton.displayName = "MainButton";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Typo.Body className="text-disabled">{label}</Typo.Body>
      <Typo.Body className="text-sub">{value}</Typo.Body>
    </div>
  );
}

const formatDeadline = (deadline: string | Date) => {
  return new Date(deadline)
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\./g, ".")
    .replace(/\s/g, "");
};
