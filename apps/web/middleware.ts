import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_AUTH_COOKIE = "access_token";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 공개 경로는 통과
  if (
    pathname === "/login" ||
    pathname === "/login/callback" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/public/") ||
    pathname.startsWith("/icon/") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // 로그인 여부 판단 (여러 쿠키명 지원: 콤마로 구분)
  const cookieEnv = process.env.NEXT_PUBLIC_AUTH_COOKIE || DEFAULT_AUTH_COOKIE;
  const cookieNames = cookieEnv.split(",").map((s) => s.trim()).filter(Boolean);
  const isLoggedIn = cookieNames.some((name) => request.cookies.has(name));

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    const nextPath = pathname + (search || "");
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // 모든 경로에서 동작하고, 내부에서 공개 경로 분기 처리
  matcher: ["/(.*)"],
};
