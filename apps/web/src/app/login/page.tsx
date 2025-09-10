"use client";

import { Button } from "../../components/ui/button";
import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "../../constants/config";
import { OnboardingCarousel } from "./OnboardingCarousel";
import PolliaIcon from "@public/svgs/pollia-icon.svg";
import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next") || "/";
  const handleKakaoLogin = useCallback(() => {
    const url = `${API_BASE_URL}/auth/kakao?next=${encodeURIComponent(nextParam)}`;
    window.location.href = url;
  }, [nextParam]);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 justify-center py-3">
        <PolliaIcon className="text-primary" width={16} height={16} />
        <PolliaWordmark className="text-black" height={24} />
      </div>

      <OnboardingCarousel />

      <Button
        className="h-12 w-full rounded-lg bg-[#FEE500] text-black hover:opacity-90"
        aria-label="카카오로 로그인하기"
        onClick={handleKakaoLogin}
      >
        카카오로 로그인하기
      </Button>
    </div>
  );
}
