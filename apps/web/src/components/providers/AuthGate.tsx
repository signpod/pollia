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
        const url = `${API_BASE_URL?.replace(/\/$/, "") || ""}/users/my-info`;
        const res = await fetch(url, { method: "GET", credentials: "include" });
        // 401/403 → 미인증
        if (res.status === 401 || res.status === 403) {
          const next = pathname + (search ? `?${search}` : "");
          router.replace(`/login?next=${encodeURIComponent(next)}`);
          return;
        }
        // 2xx면 본문 존재 여부로 판단
        if (res.ok) {
          let hasBody = false;
          try {
            const ct = res.headers.get("content-type") || "";
            if (ct.includes("application/json")) {
              const data = await res.json();
              hasBody = !!data;
            }
          } catch {
            hasBody = false;
          }
          if (hasBody) {
            if (!cancelled) setChecked(true);
            return;
          }
        }
        // 그 외 상태/본문 없음 → 로그인으로 이동
        {
          const next = pathname + (search ? `?${search}` : "");
          router.replace(`/login?next=${encodeURIComponent(next)}`);
        }
      } catch {
        // 오류 시 보수적으로 로그인 유도
        const next = pathname + (search ? `?${search}` : "");
        router.replace(`/login?next=${encodeURIComponent(next)}`);
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