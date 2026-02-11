"use server";

import type { ExchangeKakaoTokenRequest, KakaoTokenResponse } from "@/types/external/kakao";

/**
 * 카카오 Authorization Code를 Access Token과 ID Token으로 교환
 *
 * @param request - Authorization code와 redirect URI
 * @returns 카카오 토큰 응답 (access_token, id_token 포함)
 * @throws 카카오 토큰 요청 실패 시 에러
 */
export async function exchangeKakaoToken(
  request: ExchangeKakaoTokenRequest,
): Promise<KakaoTokenResponse> {
  try {
    const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY;

    if (!kakaoRestApiKey) {
      const error = new Error("KAKAO_REST_API_KEY가 설정되지 않았습니다.");
      error.cause = 500;
      throw error;
    }

    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: kakaoRestApiKey,
        redirect_uri: request.redirectUri,
        code: request.code,
        client_secret: process.env.KAKAO_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      const error = new Error(`카카오 토큰 요청 실패: ${JSON.stringify(errorData)}`);
      error.cause = tokenResponse.status;
      throw error;
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.id_token) {
      const error = new Error("id_token을 받지 못했습니다.");
      error.cause = 500;
      throw error;
    }

    return tokenData as KakaoTokenResponse;
  } catch (error) {
    console.error("❌ 카카오 토큰 교환 에러:", error);

    if (error instanceof Error && error.cause) {
      throw error;
    }

    const serverError = new Error("카카오 토큰 교환 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
