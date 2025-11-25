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
import { useEffect, useRef, useState } from "react";

export function SurveyCompletion() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: survey } = useReadSurvey(params.id);
  const { title, estimatedMinutes, deadline, imageUrl, target } = survey?.data ?? {};

  const boxRef = useRef<HTMLDivElement>(null);
  const checkIconRef = useRef<HTMLDivElement>(null);
  const surveyContentRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const infoBoxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const afterTitleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const shareButtonsRef = useRef<HTMLDivElement>(null);
  const [showContent, setShowContent] = useState(false);
  const [showFirstText, setShowFirstText] = useState(false);
  const [startAfter, setStartAfter] = useState(false);

  useEffect(() => {
    if (!boxRef.current) return;

    const tl = gsap.timeline();

    tl.fromTo(
      boxRef.current,
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
      0,
    );

    // 0.3초 대기 후 텍스트 애니메이션
    tl.to({}, { duration: 0.2 }); // 빈 애니메이션으로 딜레이 생성

    tl.call(() => {
      setShowFirstText(true);
    });

    tl.fromTo(
      textRef.current,
      {
        y: 20,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      },
    );

    tl.to(
      checkIconRef.current,
      {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
      },
      "+=0.3",
    );

    // 기존 텍스트 페이드 아웃
    tl.to(textRef.current, { opacity: 0, y: -10, duration: 0.2 }, "-=0.2");

    tl.call(() => {
      setShowFirstText(false);
      setStartAfter(true);
    });

    tl.to(
      boxRef.current,
      {
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0px 4px 20px rgba(92, 11, 11, 0.08)",
        duration: 0.3,
        ease: "power2.inOut",
      },
      "-=0.3",
    );

    // 설문 내용 표시
    tl.call(() => {
      setShowContent(true);
    });

    // afterTitle, shareButtons, button 애니메이션 (DOM 렌더링 대기)
    tl.add(() => {
      setTimeout(() => {
        if (afterTitleRef.current && shareButtonsRef.current && buttonRef.current) {
          const subTl = gsap.timeline();

          subTl.to(afterTitleRef.current, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
          subTl.to(shareButtonsRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          });
          subTl.fromTo(
            buttonRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
            "-=0.1",
          );
        }
      }, 100);
    });

    return () => {
      tl.kill();
    };
  }, []);

  // 내용이 렌더링된 후 개별 요소 애니메이션
  useEffect(() => {
    if (!showContent) return;
    if (!logoRef.current || !titleRef.current || !infoBoxRef.current) return;

    const tl = gsap.timeline({ delay: 0.2 });

    tl.fromTo(logoRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.3 },
      "-=0.1",
    );

    tl.fromTo(
      infoBoxRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.3 },
      "-=0.1",
    );

    if (imageRef.current) {
      tl.fromTo(
        imageRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3 },
        "-=0.1",
      );
    }

    return () => {
      tl.kill();
    };
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
        {showContent && !showFirstText && (
          <div ref={afterTitleRef} style={{ opacity: 0, transform: "translateY(10px)" }}>
            <Typo.MainTitle size="small" className="text-center">
              방금 참여한 설문을
              <br />
              친구들에게도 공유해보세요👀
            </Typo.MainTitle>
          </div>
        )}

        <motion.div
          layout
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          ref={boxRef}
          className="relative flex flex-col justify-center items-center bg-violet-100 rounded-[20px] p-4  overflow-visible z-20"
          style={{
            width: showContent ? "100%" : "80px",
            minHeight: showContent ? "auto" : "80px",
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
            <DotLottieReact
              src="/lotties/Pop.lottie"
              loop={false}
              autoplay
              speed={2}
              style={{ width: "600px", height: "600px" }}
            />
          </div>

          {/* 체크 아이콘 */}
          <div ref={checkIconRef} className="absolute inset-0 flex items-center justify-center">
            <Check className="text-primary size-10" strokeWidth={3} />
          </div>

          {/* 설문 카드 내용 */}
          {showContent && (
            <div ref={surveyContentRef} className="flex flex-col gap-2 w-full relative">
              <div ref={logoRef} style={{ opacity: 0 }}>
                <Image src={PolliaLogo} alt="Pollia Logo" width={52} height={16} />
              </div>
              <div ref={titleRef} style={{ opacity: 0 }}>
                <Typo.MainTitle size="small" className="text-left">
                  {title}
                </Typo.MainTitle>
              </div>
              <div
                ref={infoBoxRef}
                className="w-full flex flex-col gap-3 bg-light rounded-sm p-3"
                style={{ opacity: 0 }}
              >
                {estimatedMinutes && <InfoRow label="소요시간" value={`${estimatedMinutes}분`} />}
                {deadline && <InfoRow label="마감일" value={formatDeadline(deadline)} />}
                {target && <InfoRow label="대상자" value={target} />}
              </div>
              {imageUrl && (
                <div
                  ref={imageRef}
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
          )}
        </motion.div>

        {showFirstText && (
          <div ref={textRef}>
            <Typo.MainTitle size="small" className="text-center text-primary">
              {title}
            </Typo.MainTitle>
            <Typo.MainTitle size="small" className="text-center">
              응답을 성공적으로 제출했어요
            </Typo.MainTitle>
          </div>
        )}

        {showContent && (
          <div
            ref={shareButtonsRef}
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
        )}
      </motion.div>
      {showContent && (
        <FixedBottomLayout.Content className="px-5 py-3">
          <ButtonV2
            ref={buttonRef}
            variant="primary"
            size="large"
            className="w-full opacity-0"
            onClick={() => router.push(ROUTES.SURVEY(params.id))}
          >
            <div className="flex justify-center items-center text-center flex-1">메인으로 가기</div>
          </ButtonV2>
        </FixedBottomLayout.Content>
      )}
    </div>
  );
}

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
