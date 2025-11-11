"use server";

import type { ExchangeKakaoTokenRequest, KakaoTokenResponse } from "./types";

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
  const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY;

  if (!kakaoRestApiKey) {
    throw new Error("KAKAO_REST_API_KEY가 설정되지 않았습니다.");
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
    }),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    throw new Error(`카카오 토큰 요청 실패: ${JSON.stringify(errorData)}`);
  }

  const tokenData = await tokenResponse.json();

  if (!tokenData.id_token) {
    throw new Error("id_token을 받지 못했습니다.");
  }

  return tokenData as KakaoTokenResponse;
}
