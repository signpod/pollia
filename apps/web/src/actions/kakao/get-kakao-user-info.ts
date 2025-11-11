"use server";

import type { KakaoUserInfo } from "@/types/external/kakao";

/**
 * 카카오 Access Token으로 사용자 정보 조회
 *
 * @param accessToken - 카카오 Access Token
 * @returns 카카오 사용자 정보
 * @throws 사용자 정보 조회 실패 시 에러
 */
export async function getKakaoUserInfo(accessToken: string): Promise<KakaoUserInfo> {
  const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
  });

  if (!userResponse.ok) {
    throw new Error("카카오 사용자 정보 조회 실패");
  }

  const kakaoUser: KakaoUserInfo = await userResponse.json();
  return kakaoUser;
}
