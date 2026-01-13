import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { ACTION_NAV_COOKIE_PREFIX, AUTH_COOKIE_PREFIX } from "@/constants/cookie";

export const config = {
  matcher: [
    "/admin/:path*",
    "/me",
    "/mission/:missionId/action/:path*",
    "/mission/:missionId/done",
  ],
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(cookie => cookie.name.startsWith(AUTH_COOKIE_PREFIX));
}

async function getSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, response };
}

function extractMissionId(pathname: string): string | null {
  const match = pathname.match(/^\/mission\/([^/]+)/);
  return match?.[1] ?? null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    // 미션 경로: 쿠키 체크만으로 빠르게 처리 (getUser 호출 안 함)
    if (pathname.includes("/mission/") && pathname.includes("/action/")) {
      const missionId = extractMissionId(pathname);

      if (!hasAuthCookie(request)) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (missionId) {
        const navCookie = request.cookies.get(`${ACTION_NAV_COOKIE_PREFIX}${missionId}`);
        if (!navCookie?.value) {
          return NextResponse.redirect(new URL(`/mission/${missionId}`, request.url));
        }
      }

      return NextResponse.next();
    }

    if (pathname.includes("/mission/") && pathname.endsWith("/done")) {
      if (!hasAuthCookie(request)) {
        const missionId = extractMissionId(pathname);
        if (missionId) {
          return NextResponse.redirect(new URL(`/mission/${missionId}`, request.url));
        }
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    }

    // /admin, /me: 실제 인증 검증 필요 (getUser 호출)
    const { user, response } = await getSession(request);

    if (pathname.startsWith("/admin")) {
      if (!user) {
        return NextResponse.redirect(new URL("/login/admin", request.url));
      }
      return response;
    }

    if (pathname === "/me") {
      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return response;
    }

    return response;
  } catch (error) {
    console.error("[Middleware] Session check failed:", error);
    // 보안을 위해 에러 발생 시 로그인 페이지로 리다이렉트
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login/admin", request.url));
    }
    if (pathname === "/me" || pathname.includes("/mission/")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }
}
