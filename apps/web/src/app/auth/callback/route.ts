import { createSessionWithKakao, exchangeKakaoToken, getKakaoUserInfo } from "@/actions/kakao";
import { ensureUserExists } from "@/actions/user/ensure-user-exists";
import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // Supabase는 state 파라미터 생성
  const oauthError = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const cookieStore = await cookies();

  let next = cookieStore.get("auth_redirect")?.value ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  if (oauthError) {
    const response = NextResponse.redirect(`${origin}/login`);
    response.cookies.set(
      "auth_error",
      JSON.stringify({
        type: "oauth_provider_error",
        message:
          oauthError === "access_denied"
            ? "로그인이 취소되었습니다."
            : "카카오 로그인 중 오류가 발생했습니다.",
        detail: errorDescription,
        timestamp: Date.now(),
      }),
      {
        path: "/",
        httpOnly: false,
        maxAge: 10,
        sameSite: "lax",
      },
    );
    return response;
  }

  if (code) {
    const isSupabaseFlow = state !== null;

    if (isSupabaseFlow) {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("코드 교환 실패:", error);

        const response = NextResponse.redirect(`${origin}/login`);
        response.cookies.set(
          "auth_error",
          JSON.stringify({
            type: "exchange_failed",
            message: "로그인 처리 중 오류가 발생했습니다.",
            detail: error.message,
            timestamp: Date.now(),
          }),
          {
            path: "/",
            httpOnly: false,
            maxAge: 10,
            sameSite: "lax",
          },
        );
        return response;
      }

      if (!error) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const isNewUser = await ensureUserExists({ user });

          if (isNewUser && next === "/") {
            next = "/login/done";
          }
        }

        cookieStore.set("auth_redirect", "", {
          path: "/",
          maxAge: 0,
        });

        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`);
        }
        if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      try {
        const tokenData = await exchangeKakaoToken({
          code,
          redirectUri: `${origin}/auth/callback`,
        });

        const kakaoUser = await getKakaoUserInfo(tokenData.access_token);

        const user = await createSessionWithKakao({
          idToken: tokenData.id_token,
        });

        const userName = kakaoUser.kakao_account?.profile?.nickname;
        const isNewUser = await ensureUserExists({ user, name: userName });

        if (isNewUser && next === "/") {
          next = "/login/done";
        }

        cookieStore.set("auth_redirect", "", {
          path: "/",
          maxAge: 0,
        });

        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`);
        }
        if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        }
        return NextResponse.redirect(`${origin}${next}`);
      } catch (error) {
        console.error("카카오 SDK Flow 에러:", error);

        const response = NextResponse.redirect(`${origin}/login`);
        response.cookies.set(
          "auth_error",
          JSON.stringify({
            type: "kakao_sdk_flow_error",
            message: "로그인 처리 중 오류가 발생했습니다.",
            detail: error instanceof Error ? error.message : "Unknown error",
            timestamp: Date.now(),
          }),
          {
            path: "/",
            httpOnly: false,
            maxAge: 10,
            sameSite: "lax",
          },
        );
        return response;
      }
    }
  }

  const response = NextResponse.redirect(`${origin}/login`);
  response.cookies.set(
    "auth_error",
    JSON.stringify({
      type: "missing_code",
      message: "인증 코드가 없습니다. 다시 시도해주세요.",
      timestamp: Date.now(),
    }),
    {
      path: "/",
      httpOnly: false,
      maxAge: 10,
      sameSite: "lax",
    },
  );
  return response;
}
