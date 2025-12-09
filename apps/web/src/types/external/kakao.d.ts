/**
 * 카카오 JavaScript SDK 및 OAuth 타입 정의
 * @see https://developers.kakao.com/docs/latest/ko/javascript/getting-started
 * @see https://developers.kakao.com/sdk/reference/js/release/Kakao.Auth.html
 */

// 서버 API 관련 타입
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

// 카카오 SDK 응답 타입
export interface KakaoAuthError {
  error: {
    code: number;
    msg: string;
  };
}

export interface KakaoStatusResponse {
  status: "connected" | "not_connected";
  user?: {
    id: number;
    [key: string]: unknown;
  };
}

export interface KakaoLogoutResponse {
  id: number;
}

export interface KakaoShippingAddressResponse {
  address_id: number;
  status: "success";
}

export interface KakaoShippingAddressError {
  error_code: string;
  error_msg: string;
  status: "error";
}

declare global {
  interface Window {
    Kakao: {
      /**
       * 카카오 SDK 초기화
       * @param key - 카카오 JavaScript 앱 키
       */
      init: (key: string) => void;

      /**
       * 카카오 SDK 초기화 여부 확인
       * @returns 초기화 여부
       */
      isInitialized: () => boolean;

      /**
       * 사용한 카카오 SDK 모듈 리소스 해제
       */
      cleanup: () => void;

      /**
       * 카카오 인증 관련 API
       */
      Auth: {
        /**
         * 카카오 로그인 간편로그인
         * @param settings - 인증 설정
         */
        authorize: (settings: {
          /**
           * 인가 코드를 전달받을 서비스 서버의 URI
           */
          redirectUri: string;

          /**
           * 카카오 로그인 과정 중 동일한 값을 유지하는 임의의 문자열
           */
          state?: string;

          /**
           * 사용자에게 동의 요청할 동의항목 ID 목록 (쉼표로 구분된 문자열)
           */
          scope?: string;

          /**
           * 동의 화면에 상호작용 추가 요청 프롬프트
           * - "login": 사용자 재인증
           * - "none": 카카오톡에서 자동 로그인
           * - "create": 카카오계정 가입 후 로그인
           * - "select_account": 카카오계정 간편로그인
           */
          prompts?: "login" | "none" | "create" | "select_account";

          /**
           * 카카오계정 로그인 페이지의 ID란에 자동 입력할 값
           */
          loginHint?: string;

          /**
           * ID 토큰 재생 공격 방지를 위한 검증 값 (임의의 문자열)
           */
          nonce?: string;

          /**
           * 간편로그인 사용 여부
           * @default true
           */
          throughTalk?: boolean;
        }) => void;

        /**
         * 사용한 카카오 로그인 모듈 리소스 해제
         */
        cleanup: () => void;

        /**
         * Kakao SDK에 할당된 액세스 토큰 값 반환
         * @returns 액세스 토큰
         */
        getAccessToken: () => string | null;

        /**
         * Kakao SDK 초기화 시 사용된 앱 키 반환
         * @returns 앱 키
         */
        getAppKey: () => string;

        /**
         * 현재 사용자의 카카오 로그인 상태 반환
         * @returns 로그인 상태 정보 또는 에러
         */
        getStatusInfo: () => Promise<KakaoStatusResponse | KakaoAuthError>;

        /**
         * 로그아웃
         * @returns 로그아웃 응답 또는 에러
         */
        logout: () => Promise<KakaoLogoutResponse | KakaoAuthError>;

        /**
         * 배송지 선택하기
         * @param settings - 배송지 선택 설정
         * @returns 배송지 정보 또는 에러
         */
        selectShippingAddress: (settings?: {
          /**
           * 모바일 레이아웃으로 고정 여부
           * @default false
           */
          forceMobileLayout?: boolean;

          /**
           * 뒤로가기 버튼 활성화 여부
           * @default true
           */
          enableBackButton?: boolean;
        }) => Promise<KakaoShippingAddressResponse | KakaoShippingAddressError>;

        /**
         * 토큰 할당하기
         * @param token - 액세스 토큰
         * @param persist - 새로고침을 하더라도 액세스 토큰을 사용할 수 있도록 sessionStorage에 저장할지 여부 (기본값: true)
         */
        setAccessToken: (token: string, persist?: boolean) => void;
      };

      /**
       * 카카오 링크 공유 관련 API
       */
      Share: {
        /**
         * 기본 템플릿으로 카카오톡 공유
         * @param options - 공유 옵션
         */
        sendDefault: (options: {
          objectType: "feed" | "list" | "location" | "commerce" | "text";
          content: {
            title: string;
            description: string;
            imageUrl: string;
            link: {
              mobileWebUrl?: string;
              webUrl?: string;
            };
          };
          buttons?: Array<{
            title: string;
            link: {
              mobileWebUrl?: string;
              webUrl?: string;
            };
          }>;
        }) => void;
      };
    };
  }
}
