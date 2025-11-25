"use client";

import { useReadSurvey } from "@/hooks/survey";
import PolliaLogo from "@public/images/pollia-logo.png";
import { Typo } from "@repo/ui/components";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Check } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ConfettiParticlesBurst } from "./ConfettiParticlesBurst";

export function Before() {
  const params = useParams<{ id: string }>();
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

  const [showConfetti, setShowConfetti] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!boxRef.current) return;

    const tl = gsap.timeline();

    tl.call(() => {
      setShowConfetti(true);
    });

    tl.fromTo(
      boxRef.current,
      {
        scale: 0,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: "back.out(1.7)",
      },
      0,
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

    tl.to(
      boxRef.current,
      {
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
        duration: 0.4,
        ease: "power2.inOut",
      },
      "-=0.3",
    );

    tl.call(() => {
      setShowContent(true);
    });

    tl.to(textRef.current, { opacity: 0, y: -10 }, "-=0.1");

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
  }, [showContent, imageUrl]);

  return (
    <div className="relative w-full flex flex-col items-center gap-6 pt-[220px] flex-1 overflow-hidden bg-white">
      {showConfetti && <ConfettiParticlesBurst />}
      <motion.div
        layout
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col items-center gap-6 bg-white/80 p-6 w-full"
      >
        <motion.div
          layout
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          ref={boxRef}
          className="relative flex flex-col justify-center items-center bg-violet-100 rounded-[20px] p-4"
          style={{
            width: showContent ? "100%" : "80px",
            minHeight: showContent ? "auto" : "80px",
          }}
        >
          {/* 체크 아이콘 */}
          <div
            ref={checkIconRef}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
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

        <div ref={textRef}>
          <Typo.MainTitle size="small" className="text-center text-primary">
            가나디 설문조사
          </Typo.MainTitle>
          <Typo.MainTitle size="small" className="text-center">
            응답을 성공적으로 제출했어요
          </Typo.MainTitle>
        </div>
      </motion.div>
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
