import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_AUTH_COOKIE = "auth";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const publicPaths = ["/login", "/login/callback"];
  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/public/") ||
    pathname.startsWith("/api/");

  if (isPublic) return NextResponse.next();

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
  matcher: [
    // 모든 경로에 대해 동작하되, 로그인 관련/정적/내부 경로는 제외
    "/((?!login$|login/callback$|_next/|api/|favicon\\.ico|icon|images/|public/).*)",
  ],
};
