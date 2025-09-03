if (!process.env.NEXT_PUBLIC_APP_BASE_URL) {
  throw new Error("NEXT_PUBLIC_APP_BASE_URL 환경변수가 설정되지 않았습니다.");
}

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL 환경변수가 설정되지 않았습니다.");
}

export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
