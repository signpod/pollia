"use client";

import { useEffect, useState } from "react";

export function useKakaoSdk() {
  const [isKakaoSdkLoaded, setIsKakaoSdkLoaded] = useState(false);

  useEffect(() => {
    const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

    if (!kakaoJsKey) {
      console.warn("NEXT_PUBLIC_KAKAO_JS_KEY가 설정되지 않았습니다.");
      return;
    }

    if (window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoJsKey);
      }
      setIsKakaoSdkLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoJsKey);
        setIsKakaoSdkLoaded(true);
      }
    };
    script.onerror = () => {
      console.error("카카오 SDK 로드 실패");
    };
    document.head.appendChild(script);
  }, []);

  return { isKakaoSdkLoaded };
}
