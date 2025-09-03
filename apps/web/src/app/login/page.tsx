"use client";

import { Button } from "../../components/ui/button";
import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "../../constants/config";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next") || "/";
  const handleKakaoLogin = useCallback(() => {
    const url = `${API_BASE_URL}/auth/kakao?next=${encodeURIComponent(nextParam)}`;
    window.location.href = url;
  }, [nextParam]);
  return (
    <div className="min-h-[100svh] bg-[--color-background]" style={{ color: "var(--color-foreground)" }}>
      <div className="mx-auto grid w-full max-w-sm gap-4 p-6 pt-24">
        <h1 className="mb-2 text-xl font-semibold">로그인</h1>
        <Button
          className="h-12 w-full rounded-lg bg-[#FEE500] text-black hover:opacity-90"
          aria-label="카카오로 로그인하기"
          onClick={handleKakaoLogin}
        >
          카카오로 로그인하기
        </Button>
      </div>
    </div>
  );
}
