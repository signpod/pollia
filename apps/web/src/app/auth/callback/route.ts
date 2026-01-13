import { createSessionWithKakao, exchangeKakaoToken, getKakaoUserInfo } from "@/actions/kakao";
import { createUserIfNotExists } from "@/actions/user";
import { userService } from "@/server/services/user/userService";
import type { KakaoTokenResponse, KakaoUserInfo } from "@/types/external/kakao";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface AuthErrorOptions {
  type: string;
  message: string;
  detail?: string | null;
}

function createErrorResponse(origin: string, options: AuthErrorOptions): NextResponse {
  const response = NextResponse.redirect(`${origin}/login`);
  response.cookies.set(
    "auth_error",
    JSON.stringify({
      ...options,
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

function handleOAuthError(origin: string, error: string, description: string | null): NextResponse {
  return createErrorResponse(origin, {
    type: "oauth_provider_error",
    message:
      error === "access_denied"
        ? "로그인이 취소되었습니다."
        : "카카오 로그인 중 오류가 발생했습니다.",
    detail: description,
  });
}

function handleLoginError(origin: string, error: unknown): NextResponse {
  console.error("카카오 로그인 에러:", error);
  return createErrorResponse(origin, {
    type: "kakao_login_error",
    message: "로그인 처리 중 오류가 발생했습니다.",
    detail: error instanceof Error ? error.message : "Unknown error",
  });
}

function handleMissingCode(origin: string): NextResponse {
  return createErrorResponse(origin, {
    type: "missing_code",
    message: "인증 코드가 없습니다. 다시 시도해주세요.",
  });
}

async function exchangeToken(code: string, origin: string): Promise<KakaoTokenResponse> {
  return exchangeKakaoToken({
    code,
    redirectUri: `${origin}/auth/callback`,
  });
}

async function authenticateWithKakao(
  tokenData: KakaoTokenResponse,
  kakaoUser: KakaoUserInfo,
): Promise<User> {
  const userName = kakaoUser.kakao_account.profile.nickname;
  return createSessionWithKakao({
    idToken: tokenData.id_token,
    userName,
  });
}

interface RegisterOrUpdateUserResult {
  isNewUser: boolean;
}

async function registerOrUpdateUser(
  user: User,
  kakaoUser: KakaoUserInfo,
): Promise<RegisterOrUpdateUserResult> {
  const { nickname } = kakaoUser.kakao_account.profile;
  const { phone_number } = kakaoUser.kakao_account;

  const isNewUser = await createUserIfNotExists({
    user,
    name: nickname,
    phone: phone_number,
  });

  if (!isNewUser) {
    await userService.updateUser(user.id, { phone: phone_number });
  }

  return { isNewUser };
}

function getRedirectUrl(request: Request, origin: string, path: string): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    return `${origin}${path}`;
  }
  if (forwardedHost) {
    return `https://${forwardedHost}${path}`;
  }
  return `${origin}${path}`;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const cookieStore = await cookies();

  let next = cookieStore.get("auth_redirect")?.value ?? "/";
  if (!next.startsWith("/")) {
    next = "/";
  }

  if (oauthError) {
    return handleOAuthError(origin, oauthError, errorDescription);
  }

  if (!code) {
    return handleMissingCode(origin);
  }

  try {
    const tokenData = await exchangeToken(code, origin);
    const kakaoUser = await getKakaoUserInfo(tokenData.access_token);
    const user = await authenticateWithKakao(tokenData, kakaoUser);
    const { isNewUser } = await registerOrUpdateUser(user, kakaoUser);

    if (isNewUser && next === "/") {
      next = "/login/done";
    }

    cookieStore.set("auth_redirect", "", {
      path: "/",
      maxAge: 0,
    });

    return NextResponse.redirect(getRedirectUrl(request, origin, next));
  } catch (error) {
    return handleLoginError(origin, error);
  }
}
