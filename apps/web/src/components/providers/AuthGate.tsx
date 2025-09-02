"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "../../constants/config";

type Props = {
  children: React.ReactNode;
  publicPaths?: string[];
};

export function AuthGate({ children, publicPaths = ["/login", "/login/callback"] }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const isPublic = useMemo(() => {
    return publicPaths.some((p) => p === pathname || pathname.startsWith(p + "/"));
  }, [pathname, publicPaths]);

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (isPublic) {
        setChecked(true);
        return;
      }
      try {
        const url = `${API_BASE_URL?.replace(/\/$/, "") || ""}/auth/session`;
        const res = await fetch(url, { method: "GET", credentials: "include" });
        // 인증 실패로 간주하는 상태만 로그인으로 보냄
        if (res.status === 401 || res.status === 403) {
          const next = pathname + (search ? `?${search}` : "");
          router.replace(`/login?next=${encodeURIComponent(next)}`);
          return;
        }
        // 200, 204 등은 통과, 그 외(네트워크/CORS/기타 상태)는 강제 리다이렉트하지 않음
        if (!cancelled) setChecked(true);
      } catch {
        const next = pathname + (search ? `?${search}` : "");
        // 네트워크 오류 시에는 하얀화면 방지를 위해 통과시킴 (미들웨어가 있으면 서버단에서 차단)
        if (!cancelled) setChecked(true);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [isPublic, pathname, search, router]);

  if (!checked) {
    return (
      <div className="grid min-h-[100svh] place-items-center">
        <div className="text-sm text-[--color-muted-foreground]">로딩 중...</div>
      </div>
    );
  }

  return <>{children}</>;
}