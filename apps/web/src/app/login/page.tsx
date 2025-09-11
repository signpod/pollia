"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "../../constants/config";
import { BottomCTALayout, Button, Tooltip } from "@repo/ui/components";
import { OnboardingCarousel } from "./OnboardingCarousel";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import KakaoIcon from "@public/svgs/kakao-icon.svg";
import { cn } from "@repo/ui/lib";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next") || "/";
  const handleKakaoLogin = useCallback(() => {
    const url = `${API_BASE_URL}/auth/kakao?next=${encodeURIComponent(nextParam)}`;
    window.location.href = url;
  }, [nextParam]);
  return (
    <div className="flex flex-col gap-6 w-full min-h-screen">
      <div className="flex items-center gap-2 justify-center py-3">
        <PolliaIcon className="text-primary" width={16} height={16} />
        <PolliaWordmark className="text-black" height={24} />
      </div>

      <OnboardingCarousel />

      {/*TODO: 디자인 가이드 확인 후 삭제. 임시로 바텀 GAP 설정했습니다. 25.09.10 - 정우*/}
      <div className="h-[166px]"></div>

      <BottomCTALayout.CTA className="w-full flex justify-center bg-white">
        <div className="flex flex-col justify-center w-full max-w-lg px-5 mb-10">
          <div className="h-[82px] w-full" />
          <Tooltip
            id="kakao-login-tooltip"
            className="font-bold color-zinc-950 text-xs animate-bounce"
          >
            ⚡️ 3초만에 시작하기
          </Tooltip>
          <Button
            data-tooltip-id="kakao-login-tooltip"
            className={cn(
              "w-full box-border rounded-lg bg-[#FEE500] text-black h-11",
              "px-6 flex justify-between"
            )}
            aria-label="카카오로 로그인하기"
            onClick={handleKakaoLogin}
          >
            <KakaoIcon className="w-6 h-6" />
            <div className="font-bold leading-1.5 text-center flex-1">
              카카오로 로그인하기
            </div>
          </Button>
        </div>
      </BottomCTALayout.CTA>
    </div>
  );
}
