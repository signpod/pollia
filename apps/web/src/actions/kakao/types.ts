export interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
  id_token: string;
}

export interface KakaoUserInfo {
  id: number;
  connected_at: string;
  kakao_account?: {
    profile?: {
      nickname?: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
    };
    email?: string;
    age_range?: string;
    birthday?: string;
    gender?: string;
  };
}

export interface ExchangeKakaoTokenRequest {
  code: string;
  redirectUri: string;
}

export interface CreateSessionWithKakaoRequest {
  idToken: string;
}
