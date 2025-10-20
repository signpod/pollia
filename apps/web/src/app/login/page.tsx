import { cookies } from "next/headers";
import { LoginClient } from "./LoginClient";

interface AuthError {
  type: string;
  message: string;
  detail?: string;
  timestamp: number;
}

export default async function LoginPage() {
  const cookieStore = await cookies();
  const authErrorCookie = cookieStore.get("auth_error");

  let authError: AuthError | null = null;

  if (authErrorCookie) {
    try {
      authError = JSON.parse(authErrorCookie.value);
    } catch (e) {
      console.error("❌ [Server] 에러 파싱 실패:", e);
    }
  }

  return <LoginClient initialError={authError} />;
}
