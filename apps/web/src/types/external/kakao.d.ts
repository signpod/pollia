/**
 * 카카오 JavaScript SDK 타입 정의
 * @see https://developers.kakao.com/docs/latest/ko/javascript/getting-started
 */

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
       * 카카오 인증 관련 API
       */
      Auth: {
        /**
         * 카카오 로그인 인증 요청
         * @param options - 인증 옵션
         */
        authorize: (options: {
          /**
           * 인증 완료 후 리다이렉트될 URI
           */
          redirectUri: string;

          /**
           * 카카오톡 앱을 통한 로그인 여부
           * true 설정 시 모바일에서 카카오톡 앱으로 자동 전환
           */
          throughTalk?: boolean;

          /**
           * 로그인 화면 표시 방식
           * - "login": 항상 로그인 화면 표시
           * - "none": 자동 로그인 시도
           */
          prompts?: "login" | "none";

          /**
           * 추가 동의 받을 항목 ID 목록
           */
          scope?: string;

          /**
           * 인증 후 전달할 state 값
           */
          state?: string;
        }) => void;
      };
    };
  }
}

export {};
