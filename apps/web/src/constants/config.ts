// Storybook 환경에서는 환경변수 체크를 건너뛰기
const isStorybook = typeof window !== 'undefined' && window.location?.pathname?.includes('iframe.html');

if (!isStorybook) {
  if (!process.env.NEXT_PUBLIC_APP_BASE_URL) {
    throw new Error("NEXT_PUBLIC_APP_BASE_URL 환경변수가 설정되지 않았습니다.");
  }

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL 환경변수가 설정되지 않았습니다.");
  }

  if (!process.env.NEXT_PUBLIC_CDN_BASE_URL) {
    throw new Error("NEXT_PUBLIC_CDN_BASE_URL 환경변수가 설정되지 않았습니다.");
  }
}

export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_BASE_URL;
