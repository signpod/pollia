import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient as createServerSupabaseClient } from "@/database/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error"); // 카카오에서 보낸 에러
  const errorDescription = searchParams.get("error_description");
  const cookieStore = await cookies();

  let next = cookieStore.get("auth_redirect")?.value ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  // 1. 카카오에서 에러 반환 (사용자 취소 등)
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

  // 2. 인증 코드가 있는 경우
  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    // 코드 교환 실패
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
        const { default: prisma } = await import("@/database/utils/prisma/client");

        const existingUser = await prisma.user.findFirst({
          where: { id: user.id },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.name || user.email?.split("@")[0] || "사용자",
            },
          });

          if (next === "/") {
            next = "/login/done";
          }
        }
      }

      cookieStore.set("auth_redirect", "", {
        path: "/",
        maxAge: 0,
      });

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // 개발환경에서는 로드밸런서가 없으므로 origin 사용
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // 3. 인증 코드가 없는 경우
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
