"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// 내부 라우트 핸들러(/api/auth/kakao/exchange)를 사용해 프론트 도메인에 쿠키를 설정합니다.

export default function LoginCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/login/done";
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    async function run() {
      if (!code) {
        router.replace(
          `/login?error=missing_code&next=${encodeURIComponent(next)}`
        );
        return;
      }
      // 백엔드가 직접 쿠키를 설정하도록, 백엔드 콜백 엔드포인트로 네비게이트합니다.
      // redirect_uri는 최종 이동할 원래 페이지(absolute URL)로 전달합니다.
      const finalRedirect = `${origin}${next}`;
      const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const backendUrl = `${backendBase.replace(/\/$/, "")}/auth/callback/kakao?code=${encodeURIComponent(code)}&redirect_to=${encodeURIComponent(finalRedirect)}`;
      window.location.href = backendUrl;
    }
    run();
  }, [router, code, next, origin]);

  return (
    <div className="grid min-h-[100svh] place-items-center">
      <div className="text-sm text-[--color-muted-foreground]">
        로그인 처리 중...
      </div>
    </div>
  );
}
