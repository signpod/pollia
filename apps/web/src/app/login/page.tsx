import { getAuthError } from "@/lib/getAuthError";
import { LoginClient } from "./LoginClient";

export default async function LoginPage() {
  const authError = await getAuthError();

  return <LoginClient initialError={authError} />;
}
