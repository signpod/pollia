import { ACTION_NAV_COOKIE_PREFIX, AUTH_COOKIE_PREFIX } from "@/constants/cookie";
import { WHITE_LABEL_PREFIX } from "@/constants/routes";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/admin/:path*",
    "/editor/:path*",
    "/me/:path*",
    "/mission/:missionId/action/:path*",
    "/mission/:missionId/done",
    "/wl/:path*",
  ],
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

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
    // /wl/* → /* rewrite (white-label)
    if (pathname.startsWith(`${WHITE_LABEL_PREFIX}/`)) {
      const rewrittenPath = pathname.replace(new RegExp(`^${WHITE_LABEL_PREFIX}`), "");
      const url = request.nextUrl.clone();
      url.pathname = rewrittenPath;
      return NextResponse.rewrite(url);
    }

    // 미션 경로: nav 쿠키로 인트로 페이지 경유 여부 확인
    // 인증은 서버 액션(resolveMissionActor)에서 처리
    if (pathname.includes("/mission/") && pathname.includes("/action/")) {
      const missionId = extractMissionId(pathname);

      if (missionId) {
        const navCookie = request.cookies.get(`${ACTION_NAV_COOKIE_PREFIX}${missionId}`);
        if (!navCookie?.value) {
          return NextResponse.redirect(new URL(`/mission/${missionId}`, request.url));
        }
      }

      return NextResponse.next();
    }

    if (pathname.includes("/mission/") && pathname.endsWith("/done")) {
      return NextResponse.next();
    }

    // /admin, /me: 실제 인증 검증 필요 (getUser 호출)
    const { user, response } = await getSession(request);

    if (pathname.startsWith("/admin") || pathname.startsWith("/editor")) {
      if (!user) {
        return NextResponse.redirect(new URL("/login/admin", request.url));
      }
      return response;
    }

    if (pathname === "/me" || pathname.startsWith("/me/")) {
      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return response;
    }

    return response;
  } catch (error) {
    console.error("[Middleware] Session check failed:", error);
    // 보안을 위해 에러 발생 시 로그인 페이지로 리다이렉트
    if (pathname.startsWith("/admin") || pathname.startsWith("/editor")) {
      return NextResponse.redirect(new URL("/login/admin", request.url));
    }
    if (pathname === "/me" || pathname.startsWith("/me/") || pathname.includes("/mission/")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }
}
