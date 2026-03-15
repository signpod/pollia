import { createSessionWithKakao, exchangeKakaoToken, getKakaoUserInfo } from "@/actions/kakao";
import { createUserIfNotExists } from "@/actions/user";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { fileUploadService } from "@/server/services/file-upload";
import { userService } from "@/server/services/user/userService";
import type { KakaoTokenResponse, KakaoUserInfo } from "@/types/external/kakao";
import { ActionType } from "@prisma/client";
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
  const email = kakaoUser.kakao_account.email;
  const phone = kakaoUser.kakao_account.phone_number;
  return createSessionWithKakao({
    idToken: tokenData.id_token,
    userName,
    email,
    phone,
  });
}

async function registerOrUpdateUser(
  user: User,
  kakaoUser: KakaoUserInfo,
): Promise<{ isNewUser: boolean }> {
  const { nickname } = kakaoUser.kakao_account.profile;
  const { phone_number, has_email, email } = kakaoUser.kakao_account;

  if (!has_email || !email) {
    const error = new Error(
      "이메일 정보가 필요합니다. 카카오 계정에서 이메일 제공에 동의해주세요.",
    );
    error.cause = 400;
    throw error;
  }

  const isNewUser = await createUserIfNotExists({
    user,
    name: nickname,
    phone: phone_number,
    email,
  });

  if (!isNewUser) {
    await userService.updateUser(user.id, { phone: phone_number });
  }

  return { isNewUser };
}

async function uploadKakaoProfileImage(userId: string, kakaoUser: KakaoUserInfo): Promise<void> {
  const profileImageUrl = kakaoUser.kakao_account.profile.profile_image_url;
  if (!profileImageUrl) return;

  const imageResponse = await fetch(profileImageUrl);
  if (!imageResponse.ok) return;

  const imageBuffer = await imageResponse.arrayBuffer();
  const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
  const extension = contentType.includes("png") ? "png" : "jpg";

  const { uploadUrl, fileUploadId } = await fileUploadService.createUploadUrl(
    {
      fileName: `kakao-profile.${extension}`,
      fileSize: imageBuffer.byteLength,
      fileType: contentType,
      bucket: STORAGE_BUCKETS.USER_PROFILE_IMAGES,
      actionType: ActionType.IMAGE,
    },
    userId,
  );

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: imageBuffer,
  });

  if (!uploadResponse.ok) return;

  await userService.updateUser(userId, {
    profileImageFileUploadId: fileUploadId,
  });
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

    if (isNewUser) {
      uploadKakaoProfileImage(user.id, kakaoUser).catch(error =>
        console.error("카카오 프로필 이미지 업로드 실패:", error),
      );

      const kakaoProfileImageUrl = kakaoUser.kakao_account.profile.profile_image_url;
      if (kakaoProfileImageUrl) {
        cookieStore.set("kakao_profile_image", kakaoProfileImageUrl, {
          path: "/",
          httpOnly: false,
          maxAge: 60 * 5,
          sameSite: "lax",
        });
      }

      if (next === "/") {
        next = "/login/done";
      }
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
