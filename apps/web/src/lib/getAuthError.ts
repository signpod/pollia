import { cookies } from "next/headers";

export interface AuthError {
  type: string;
  message: string;
  detail?: string;
  timestamp: number;
}

const AUTH_ERROR_COOKIE_NAME = "auth_error";

export async function getAuthError(): Promise<AuthError | null> {
  const cookieStore = await cookies();
  const authErrorCookie = cookieStore.get(AUTH_ERROR_COOKIE_NAME);

  if (!authErrorCookie) return null;

  try {
    return JSON.parse(authErrorCookie.value);
  } catch (e) {
    console.error("❌ [Server] 에러 파싱 실패:", e);
    return null;
  }
}
